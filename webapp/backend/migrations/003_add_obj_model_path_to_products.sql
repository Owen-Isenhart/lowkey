-- Add obj_model_path column to products table for 3D flavor displays
ALTER TABLE products
ADD COLUMN obj_model_path VARCHAR(255);

-- Add index for model path queries
CREATE INDEX idx_products_obj_model_path ON products(obj_model_path);
