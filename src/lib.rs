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
    ExtendedColorType,
    ImageEncoder,
};
use image::codecs::jpeg::JpegEncoder;
use image::codecs::png::{ CompressionType, PngEncoder };

use std::io::Cursor;
use serde::Deserialize;
use serde_wasm_bindgen::from_value;

#[derive(Deserialize)]
struct ResizeOptions {
    width: Option<u32>,
    height: Option<u32>,
    quality: Option<f32>,
    format: String,
    brightness: f32,
    resampling: u32,
}

#[wasm_bindgen]
pub fn resize_image(data: &[u8], options: JsValue) -> Result<Box<[u8]>, JsValue> {
    let options: ResizeOptions = from_value(options).map_err(|e|
        JsValue::from_str(&format!("Invalid options: {}", e))
    )?;

    let value = map_brightness(options.brightness);

    let img = ImageReader::new(Cursor::new(data))
        .with_guessed_format()
        .map_err(|e| JsValue::from_str(&format!("Format guess failed: {}", e)))?
        .decode()
        .map_err(|e| JsValue::from_str(&format!("Decode failed: {}", e)))?
        .brighten(value);

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

    let format = parse_format(&options.format).ok_or_else(||
        JsValue::from_str("Unsupported format")
    )?;
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
    match fmt.to_lowercase().as_str() {
        "png" => Some(ImageFormat::Png),
        "jpeg" | "jpg" => Some(ImageFormat::Jpeg),
        "webp" => Some(ImageFormat::WebP),
        _ => None,
    }
}

fn encode_image(
    image: &DynamicImage,
    format: &ImageFormat,
    options: &ResizeOptions
) -> Result<Vec<u8>, JsValue> {
    let mut buffer = Vec::new();
    let quality = (options.quality.unwrap_or(0.7) * 100.0).round().clamp(1.0, 100.0) as u8;

    match format {
        ImageFormat::Jpeg => {
            let mut encoder = JpegEncoder::new_with_quality(&mut buffer, quality);
            encoder
                .encode_image(image)
                .map_err(|e| JsValue::from_str(&format!("JPEG encode failed: {}", e)))?;
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
                .map_err(|e| JsValue::from_str(&format!("Write failed: {}", e)))?;
        }
    }

    Ok(buffer)
}

fn encode_as_png(image: &DynamicImage, buffer: &mut Vec<u8>) -> Result<(), JsValue> {
    let rgba = image.to_rgba8();
    let (w, h) = rgba.dimensions();

    let encoder = PngEncoder::new_with_quality(
        buffer,
        CompressionType::Default,
        image::codecs::png::FilterType::Adaptive
    );

    encoder
        .write_image(&rgba, w, h, ExtendedColorType::Rgba8)
        .map_err(|e| JsValue::from_str(&format!("PNG encode failed: {}", e)))
}

fn encode_as_webp(
    image: &DynamicImage,
    buffer: &mut Vec<u8>
) -> Result<(), JsValue> {
    let rgba = image.to_rgba8();
    let (width, height) = rgba.dimensions();

    let encoder = WebPEncoder::new_lossless(buffer);
    encoder
        .encode(&rgba, width, height, ExtendedColorType::Rgba8)
        .map_err(|e| {
            console::error_1(&JsValue::from_str(&format!("WebP encode failed: {}", e)));
            JsValue::from_str("Image encoding failed")
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
}
