use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use web_sys::console;

use image::codecs::webp::WebPEncoder;
use image::{
    imageops::FilterType,
    GenericImageView,
    ImageReader,
    DynamicImage,
    ImageFormat,
    ImageEncoder,
};
use image::codecs::jpeg::JpegEncoder;
use image::codecs::png::{ CompressionType, PngEncoder };

use std::io::Cursor;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;

type ToolkitResult<T> = Result<T, ToolkitError>;
const DEFAULT_QUALITY: f32 = 0.7;

#[derive(Debug)]
enum ToolkitError {
    InvalidOptions(String),
    FormatGuessFailed(String),
    DecodeFailed(String),
    UnsupportedFormat,
    JpegEncodeFailed(String),
    PngEncodeFailed(String),
    WebpEncodeFailed,
    WriteFailed(String),
}

impl ToolkitError {
    fn user_message(&self) -> &'static str {
        match self {
            ToolkitError::InvalidOptions(_) => "Invalid options",
            ToolkitError::UnsupportedFormat => "Unsupported format",
            _ => "Image processing failed",
        }
    }

    fn internal_log_message(&self) -> Option<String> {
        match self {
            ToolkitError::InvalidOptions(e) => {
                Some(format!("[img-toolkit] Invalid options error: {}", e))
            }
            ToolkitError::FormatGuessFailed(e) => {
                Some(format!("[img-toolkit] Format guess failed with internal error: {}", e))
            }
            ToolkitError::DecodeFailed(e) => {
                Some(format!("[img-toolkit] Decode failed with internal error: {}", e))
            }
            ToolkitError::JpegEncodeFailed(e) => {
                Some(format!("[img-toolkit] JPEG encode failed with internal error: {}", e))
            }
            ToolkitError::PngEncodeFailed(e) => {
                Some(format!("[img-toolkit] PNG encode failed with internal error: {}", e))
            }
            ToolkitError::WriteFailed(e) => {
                Some(format!("[img-toolkit] Image write failed with internal error: {}", e))
            }
            ToolkitError::UnsupportedFormat | ToolkitError::WebpEncodeFailed => None,
        }
    }
}

impl From<ToolkitError> for JsValue {
    fn from(error: ToolkitError) -> Self {
        if let Some(log) = error.internal_log_message() {
            console::error_1(&JsValue::from_str(&log));
        }

        JsValue::from_str(error.user_message())
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ResizeOptions {
    width: Option<u32>,
    height: Option<u32>,
    quality: Option<f32>,
    format: String,
    brightness: f32,
    resampling: u32,
    rotate: Option<u32>,
    flip: Option<String>,
    crop_x: Option<u32>,
    crop_y: Option<u32>,
    crop_w: Option<u32>,
    crop_h: Option<u32>,
    contrast: Option<f32>,
    blur: Option<f32>,
    grayscale: Option<bool>,
}

#[wasm_bindgen]
pub fn resize_image(data: &[u8], options: JsValue) -> Result<Box<[u8]>, JsValue> {
    resize_image_impl(data, options).map_err(JsValue::from)
}

fn resize_image_impl(data: &[u8], options: JsValue) -> ToolkitResult<Box<[u8]>> {
    let options: ResizeOptions = from_value(options).map_err(|e|
        ToolkitError::InvalidOptions(e.to_string())
    )?;
    resize_image_with_options(data, options)
}

fn resize_image_with_options(data: &[u8], options: ResizeOptions) -> ToolkitResult<Box<[u8]>> {
    let value = map_brightness(options.brightness);

    let mut img = ImageReader::new(Cursor::new(data))
        .with_guessed_format()
        .map_err(|e| ToolkitError::FormatGuessFailed(e.to_string()))?
        .decode()
        .map_err(|e| ToolkitError::DecodeFailed(e.to_string()))?;

    // 1. Crop (applied first for performance)
    if let (Some(x), Some(y), Some(w), Some(h)) = (options.crop_x, options.crop_y, options.crop_w, options.crop_h) {
        if w > 0 && h > 0 {
            let (orig_w, orig_h) = img.dimensions();
            let x = x.min(orig_w);
            let y = y.min(orig_h);
            let w = w.min(orig_w - x);
            let h = h.min(orig_h - y);
            if w > 0 && h > 0 {
                img = img.crop_imm(x, y, w, h);
            }
        }
    }

    // 2. Adjustments (Brightness, Contrast, Grayscale, Blur)
    if value != 0 {
        img = img.brighten(value);
    }

    if let Some(contrast) = options.contrast {
        if contrast != 0.0 && contrast.is_finite() {
            img = img.adjust_contrast(contrast);
        }
    }

    if let Some(true) = options.grayscale {
        img = img.grayscale();
    }

    if let Some(blur) = options.blur {
        if blur > 0.0 && blur.is_finite() {
            img = img.blur(blur);
        }
    }

    // 3. Transformations (Rotate & Flip)
    if let Some(rotate) = options.rotate {
        img = match rotate {
            90 => img.rotate90(),
            180 => img.rotate180(),
            270 => img.rotate270(),
            _ => img,
        };
    }

    if let Some(flip) = &options.flip {
        img = match flip.as_str() {
            "horizontal" | "h" => img.fliph(),
            "vertical" | "v" => img.flipv(),
            "both" | "hv" | "vh" => img.fliph().flipv(),
            _ => img,
        };
    }

    // 4. Resize
    let (orig_w, orig_h) = img.dimensions();

    let filter = get_filter_type(options.resampling);

    let width = options.width.filter(|&w| w > 0);
    let height = options.height.filter(|&h| h > 0);
    let resized = match (width, height) {
        (Some(w), Some(h)) => img.resize_exact(w, h, filter),
        (Some(w), None) => {
            let h = scaled_height_for_width(w, orig_w, orig_h);
            img.resize(w, h, filter)
        }
        (None, Some(h)) => {
            let w = scaled_width_for_height(h, orig_w, orig_h);
            img.resize(w, h, filter)
        }
        (None, None) => img,
    };

    let format = parse_format(&options.format).ok_or(ToolkitError::UnsupportedFormat)?;
    let buffer = encode_image(&resized, &format, &options)?;
    Ok(buffer.into_boxed_slice())
}

fn get_filter_type(level: u32) -> FilterType {
    match level.clamp(0, 10) {
        0 | 1 => FilterType::Nearest,
        2 | 3 => FilterType::Triangle,
        4 | 5 => FilterType::CatmullRom,
        6 | 7 => FilterType::Gaussian,
        _ => FilterType::Lanczos3,
    }
}

fn parse_format(fmt: &str) -> Option<ImageFormat> {
    if fmt.eq_ignore_ascii_case("png") {
        Some(ImageFormat::Png)
    } else if fmt.eq_ignore_ascii_case("jpeg") || fmt.eq_ignore_ascii_case("jpg") {
        Some(ImageFormat::Jpeg)
    } else if fmt.eq_ignore_ascii_case("webp") {
        Some(ImageFormat::WebP)
    } else {
        None
    }
}

fn encode_image(
    image: &DynamicImage,
    format: &ImageFormat,
    options: &ResizeOptions
) -> ToolkitResult<Vec<u8>> {
    let mut buffer = Vec::new();
    let quality = normalized_quality_u8(options.quality);

    match format {
        ImageFormat::Jpeg => {
            let mut encoder = JpegEncoder::new_with_quality(&mut buffer, quality);
            encoder
                .encode_image(image)
                .map_err(|e| ToolkitError::JpegEncodeFailed(e.to_string()))?;
        }
        ImageFormat::Png => {
            encode_as_png(image, &mut buffer)?;
        }
        ImageFormat::WebP => {
            encode_as_webp(image, &mut buffer)?;
        }
        _ => {
            image
                .write_to(&mut Cursor::new(&mut buffer), *format)
                .map_err(|e| ToolkitError::WriteFailed(e.to_string()))?;
        }
    }

    Ok(buffer)
}

fn normalized_quality_u8(raw_quality: Option<f32>) -> u8 {
    let quality_f = raw_quality.unwrap_or(DEFAULT_QUALITY);
    let quality_f = if quality_f.is_finite() {
        quality_f
    } else {
        DEFAULT_QUALITY
    };
    (quality_f * 100.0).round().clamp(1.0, 100.0) as u8
}

fn encode_as_png(image: &DynamicImage, buffer: &mut Vec<u8>) -> ToolkitResult<()> {
    let (w, h) = image.dimensions();
    let color = image.color();

    let encoder = PngEncoder::new_with_quality(
        buffer,
        CompressionType::Default,
        image::codecs::png::FilterType::Adaptive
    );

    encoder
        .write_image(image.as_bytes(), w, h, color.into())
        .map_err(|e| ToolkitError::PngEncodeFailed(e.to_string()))
}

fn encode_as_webp(
    image: &DynamicImage,
    buffer: &mut Vec<u8>
) -> ToolkitResult<()> {
    let (width, height) = image.dimensions();
    let color = image.color();

    let encoder = WebPEncoder::new_lossless(buffer);
    encoder
        .encode(image.as_bytes(), width, height, color.into())
        .map_err(|_| {
            console::error_1(&JsValue::from_str("[img-toolkit][ERR_WEBP_ENCODE] encode failed"));
            ToolkitError::WebpEncodeFailed
        })
}

fn map_brightness(x: f32) -> i32 {
    let x = x.clamp(0.0, 1.0);
    let v = x * 510.0 - 255.0;
    v.round() as i32
}

fn scaled_height_for_width(width: u32, orig_w: u32, orig_h: u32) -> u32 {
    (((width as f32) * (orig_h as f32)) / (orig_w as f32)).round() as u32
}

fn scaled_width_for_height(height: u32, orig_w: u32, orig_h: u32) -> u32 {
    (((height as f32) * (orig_w as f32)) / (orig_h as f32)).round() as u32
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::RgbaImage;
    use std::io::Cursor;

    fn make_test_png(width: u32, height: u32) -> Vec<u8> {
        let rgba = RgbaImage::from_pixel(width, height, image::Rgba([120, 80, 200, 255]));
        let img = DynamicImage::ImageRgba8(rgba);
        let mut bytes = Vec::new();
        img.write_to(&mut Cursor::new(&mut bytes), ImageFormat::Png).unwrap();
        bytes
    }

    fn decode_image(bytes: &[u8]) -> (ImageFormat, DynamicImage) {
        let mut reader = ImageReader::new(Cursor::new(bytes));
        reader = reader.with_guessed_format().unwrap();
        let format = reader.format().unwrap();
        let image = reader.decode().unwrap();
        (format, image)
    }

    fn make_test_options(format: &str) -> ResizeOptions {
        ResizeOptions {
            width: None,
            height: None,
            quality: None,
            format: format.to_string(),
            brightness: 0.5,
            resampling: 4,
            rotate: None,
            flip: None,
            crop_x: None,
            crop_y: None,
            crop_w: None,
            crop_h: None,
            contrast: None,
            blur: None,
            grayscale: None,
        }
    }

    #[test]
    fn map_brightness_clamps_range() {
        assert_eq!(map_brightness(-1.0), -255);
        assert_eq!(map_brightness(0.0), -255);
        assert_eq!(map_brightness(1.0), 255);
        assert_eq!(map_brightness(2.0), 255);
    }

    #[test]
    fn map_brightness_midpoint_is_zero() {
        assert_eq!(map_brightness(0.5), 0);
    }

    #[test]
    fn filter_type_mapping_is_stable() {
        assert_eq!(get_filter_type(0), FilterType::Nearest);
        assert_eq!(get_filter_type(3), FilterType::Triangle);
        assert_eq!(get_filter_type(5), FilterType::CatmullRom);
        assert_eq!(get_filter_type(7), FilterType::Gaussian);
        assert_eq!(get_filter_type(10), FilterType::Lanczos3);
        assert_eq!(get_filter_type(99), FilterType::Lanczos3);
    }

    #[test]
    fn parse_format_supports_expected_aliases() {
        assert_eq!(parse_format("png"), Some(ImageFormat::Png));
        assert_eq!(parse_format("jpg"), Some(ImageFormat::Jpeg));
        assert_eq!(parse_format("jpeg"), Some(ImageFormat::Jpeg));
        assert_eq!(parse_format("webp"), Some(ImageFormat::WebP));
        assert_eq!(parse_format("gif"), None);
    }

    #[test]
    fn aspect_ratio_helpers_round_as_expected() {
        assert_eq!(scaled_height_for_width(400, 1200, 800), 267);
        assert_eq!(scaled_width_for_height(267, 1200, 800), 401);
    }

    #[test]
    fn resize_image_exact_dimensions_encodes_as_jpeg() {
        let input = make_test_png(120, 80);
        let mut options = make_test_options("jpg");
        options.width = Some(64);
        options.height = Some(64);

        let output = resize_image_with_options(&input, options).unwrap();
        let (format, decoded) = decode_image(&output);

        assert_eq!(format, ImageFormat::Jpeg);
        assert_eq!(decoded.dimensions(), (64, 64));
    }

    #[test]
    fn resize_image_single_dimension_preserves_aspect_ratio() {
        let input = make_test_png(120, 80);
        let mut options = make_test_options("png");
        options.width = Some(60);
        options.quality = Some(0.7);

        let output = resize_image_with_options(&input, options).unwrap();
        let (format, decoded) = decode_image(&output);

        assert_eq!(format, ImageFormat::Png);
        assert_eq!(decoded.dimensions(), (60, 40));
    }

    #[test]
    fn resize_image_rejects_unsupported_format() {
        let input = make_test_png(32, 32);
        let mut options = make_test_options("gif");
        options.width = Some(32);
        options.height = Some(32);

        let err = resize_image_with_options(&input, options).unwrap_err();
        assert!(matches!(err, ToolkitError::UnsupportedFormat));
    }

    #[test]
    fn resize_image_without_dimensions_keeps_original_size() {
        let input = make_test_png(120, 80);
        let options = make_test_options("png");

        let output = resize_image_with_options(&input, options).unwrap();
        let (format, decoded) = decode_image(&output);

        assert_eq!(format, ImageFormat::Png);
        assert_eq!(decoded.dimensions(), (120, 80));
    }

    #[test]
    fn resize_image_returns_decode_error_for_invalid_input_bytes() {
        let input = vec![0x00, 0x11, 0x22, 0x33];
        let mut options = make_test_options("jpg");
        options.width = Some(32);
        options.height = Some(32);

        let err = resize_image_with_options(&input, options).unwrap_err();
        assert!(
            matches!(
                err,
                ToolkitError::FormatGuessFailed(_) | ToolkitError::DecodeFailed(_)
            )
        );
    }

    #[test]
    fn resize_image_encodes_as_webp() {
        let input = make_test_png(96, 64);
        let mut options = make_test_options("webp");
        options.width = Some(48);
        options.height = Some(32);
        options.quality = Some(0.7);

        let output = resize_image_with_options(&input, options).unwrap();
        let (format, decoded) = decode_image(&output);

        assert_eq!(format, ImageFormat::WebP);
        assert_eq!(decoded.dimensions(), (48, 32));
    }

    #[test]
    fn test_new_features_crop_rotate_flip_adjustments() {
        let input = make_test_png(100, 100);
        let mut options = make_test_options("png");
        options.crop_x = Some(10);
        options.crop_y = Some(10);
        options.crop_w = Some(80);
        options.crop_h = Some(80);
        options.rotate = Some(90);
        options.flip = Some("horizontal".to_string());
        options.contrast = Some(0.5);
        options.grayscale = Some(true);
        options.blur = Some(1.0);

        let output = resize_image_with_options(&input, options).unwrap();
        let (format, decoded) = decode_image(&output);

        assert_eq!(format, ImageFormat::Png);
        // Original: 100x100 -> Cropped to 80x80 -> Rotated 90 -> 80x80
        assert_eq!(decoded.dimensions(), (80, 80));
    }

    #[test]
    fn toolkit_error_user_messages_follow_exposure_policy() {
        assert_eq!(ToolkitError::InvalidOptions("x".to_string()).user_message(), "Invalid options");
        assert_eq!(ToolkitError::UnsupportedFormat.user_message(), "Unsupported format");
        assert_eq!(
            ToolkitError::DecodeFailed("x".to_string()).user_message(),
            "Image processing failed"
        );
        assert_eq!(ToolkitError::WebpEncodeFailed.user_message(), "Image processing failed");
    }

    #[test]
    fn quality_normalization_rejects_non_finite_values() {
        assert_eq!(normalized_quality_u8(None), 70);
        assert_eq!(normalized_quality_u8(Some(f32::NAN)), 70);
        assert_eq!(normalized_quality_u8(Some(f32::INFINITY)), 70);
        assert_eq!(normalized_quality_u8(Some(f32::NEG_INFINITY)), 70);
        assert_eq!(normalized_quality_u8(Some(0.0)), 1);
        assert_eq!(normalized_quality_u8(Some(1.0)), 100);
    }
}
