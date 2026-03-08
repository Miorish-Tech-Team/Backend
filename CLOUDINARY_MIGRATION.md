# Cloudinary Migration - Image Upload System

## Summary
Successfully migrated all image uploads from Supabase Storage to Cloudinary. All image uploads throughout the backend now use Cloudinary as the storage provider.

## Changes Made

### 1. Created Cloudinary Configuration
**File:** `Backend/config/cloudinaryConfig/cloudinary.js`
- Configured Cloudinary SDK with credentials from `.env`
- Environment variables used:
  - `CLOUDINARY_CLOUD_NAME=df4aytnor`
  - `CLOUDINARY_API_KEY=878697313592214`
  - `CLOUDINARY_API_SECRET=FkkKKnlbygmUKsIeULcPtdV7MTI`

### 2. Updated Upload Middleware
**File:** `Backend/config/uploadComfig/upload.js`
- Replaced Supabase storage with Cloudinary upload stream
- Changed `uploadToSupabase()` function to `uploadToCloudinary()`
- All uploads now go to Cloudinary folder: `miorish/`
- Maintained existing middleware structure:
  - `single()` - for single file uploads (sets `req.fileUrl`)
  - `array()` - for multiple file uploads (sets `req.fileUrls`)
  - `fields()` - for multiple field uploads (sets `req.files[fieldName][].location`)

## Affected Features

All image uploads now use Cloudinary for the following features:

### User Features
1. **User Profile Photos** - `profileRoute/userProfileRoute.js`
2. **Product Reviews with Photos** - `reviewRoute/reviewRoute.js`
3. **Support Tickets with Images** - `ticketRoute/userTicketRoute.js`

### Seller Features
1. **Seller Registration**
   - Shop Logo
   - Business License Document
   - Tax Document
2. **Seller Profile Updates**
   - Shop Logo
   - Tax Document
   - Identity Proof
3. **Product Management**
   - Cover Images
   - Gallery Images (up to 5 per product)
4. **Support Tickets with Images** - `ticketRoute/sellerTicketRoute.js`

### Admin Features
1. **Product Management**
   - Cover Images
   - Gallery Images
2. **Category Management**
   - Category Images
   - Subcategory Images
3. **Blog Management**
   - Blog Cover Images
4. **Website Advertisements**
   - Website Logo
   - Homepage Banners
   - Weekly Promotion Banners
   - The Popular Section Banners
   - Brand Ads Posters
   - Product Poster Ads

## Technical Details

### Upload Function
```javascript
const uploadToCloudinary = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "miorish",
        public_id: fileName.replace(fileExt, ""),
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};
```

### Image Storage Location
- All images are stored in Cloudinary folder: `miorish/`
- Each image gets a unique UUID-based filename
- Returns secure HTTPS URLs for all uploaded images

## Routes Using Image Uploads

1. `routes/authRoute/sellerAuthRoute.js` - Seller registration
2. `routes/profileRoute/userProfileRoute.js` - User profile
3. `routes/profileRoute/sellerProfileRoute.js` - Seller profile
4. `routes/sellerRoute/product/handleProductRoute.js` - Seller products
5. `routes/adminRoute/productDetail/productDetailRoute.js` - Admin products
6. `routes/adminRoute/handleCategory/handleCategoryRoute.js` - Categories
7. `routes/adminRoute/handleCategory/handleSubCategoryRoute.js` - Subcategories
8. `routes/blogRoute/blogRoute.js` - Blogs
9. `routes/reviewRoute/reviewRoute.js` - Product reviews
10. `routes/ticketRoute/userTicketRoute.js` - User support tickets
11. `routes/ticketRoute/sellerTicketRoute.js` - Seller support tickets
12. `routes/advertisementRoute/logoRoute.js` - Website logo
13. `routes/advertisementRoute/Banner.js` - All banner advertisements

## Controllers Updated (Verified Compatible)

All controllers continue to work without modification as they use the middleware-provided properties:
- `req.fileUrl` - for single file uploads
- `req.fileUrls` - for array uploads
- `req.files[fieldName][0].location` - for fields uploads

## Dependencies

- **Cloudinary package**: Already installed (`cloudinary: ^2.9.0`)
- **Multer**: Continues to handle file parsing
- **UUID**: Generates unique filenames

## Testing Recommendations

1. Test user profile photo upload
2. Test product creation with cover and gallery images
3. Test seller registration with documents
4. Test blog creation with image
5. Test category/subcategory image uploads
6. Test review submission with photo
7. Test support ticket with image attachment
8. Test all advertisement banner uploads

## Notes

- All existing Supabase images remain accessible at their old URLs
- New uploads will use Cloudinary URLs (format: `https://res.cloudinary.com/df4aytnor/...`)
- No controller code was modified - all changes in middleware only
- Cloudinary automatically handles image optimization and transformations
- Resource type is set to "auto" to handle all file types (images, PDFs, etc.)

## Migration Complete ✓

The backend is now fully configured to use Cloudinary for all image uploads. The Supabase storage configuration remains in place but is no longer used for new uploads.
