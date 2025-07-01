use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

use image::codecs::webp::WebPEncoder;
use image::{
    imageops::resize,
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
        (Some(w), Some(h)) => {
            let buf = resize(&img.to_rgba8(), w, h, filter);
            DynamicImage::ImageRgba8(buf)
        }
        (Some(w), None) => {
            let h = (((w as f32) * (orig_h as f32)) / (orig_w as f32)).round() as u32;
            img.resize(w, h, filter)
        }
        (None, Some(h)) => {
            let w = (((h as f32) * (orig_w as f32)) / (orig_h as f32)).round() as u32;
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
    let quality = (options.quality.unwrap_or(0.8) * 100.0).round().clamp(1.0, 100.0) as u8;

    match format {
        ImageFormat::Jpeg => {
            let mut encoder = JpegEncoder::new_with_quality(&mut buffer, quality);
            encoder
                .encode_image(image)
                .map_err(|e| JsValue::from_str(&format!("JPEG encode failed: {}", e)))?;
        }
        ImageFormat::Png => {
            let recompressed = compress_to_jpeg(image, quality)?;
            encode_as_png(&recompressed, &mut buffer)?;
        }
        ImageFormat::WebP => {
            let recompressed = compress_to_jpeg(image, quality)?;
            encode_as_webp(&recompressed, &mut buffer)?;
        }
        _ => {
            image
                .write_to(&mut Cursor::new(&mut buffer), *format)
                .map_err(|e| JsValue::from_str(&format!("Write failed: {}", e)))?;
        }
    }

    Ok(buffer)
}

fn compress_to_jpeg(image: &DynamicImage, quality: u8) -> Result<DynamicImage, JsValue> {
    let mut temp_jpeg = Vec::new();
    let mut jpeg_encoder = JpegEncoder::new_with_quality(&mut temp_jpeg, quality);
    jpeg_encoder
        .encode_image(image)
        .map_err(|e| JsValue::from_str(&format!("Interim JPEG encode failed: {}", e)))?;

    image
        ::load_from_memory(&temp_jpeg)
        .map_err(|e| JsValue::from_str(&format!("JPEG decode failed: {}", e)))
}

fn encode_as_png(image: &DynamicImage, buffer: &mut Vec<u8>) -> Result<(), JsValue> {
    let rgba = image.to_rgba8();
    let (w, h) = rgba.dimensions();

    let encoder = PngEncoder::new_with_quality(
        buffer,
        CompressionType::Best,
        image::codecs::png::FilterType::Adaptive
    );

    encoder
        .write_image(&rgba, w, h, ExtendedColorType::Rgba8)
        .map_err(|e| JsValue::from_str(&format!("PNG encode failed: {}", e)))
}

fn encode_as_webp(image: &DynamicImage, buffer: &mut Vec<u8>) -> Result<(), JsValue> {
    let rgba = image.to_rgba8();
    let (width, height) = rgba.dimensions();

    let encoder = WebPEncoder::new_lossless(buffer);
    encoder
        .encode(&rgba, width, height, ExtendedColorType::Rgba8)
        .map_err(|e| JsValue::from_str(&format!("WebP encode failed: {}", e)))
}

fn map_brightness(x: f32) -> i32 {
    let x = x.clamp(0.0, 1.0);
    let v = x * 510.0 - 255.0;
    v.round() as i32
}
