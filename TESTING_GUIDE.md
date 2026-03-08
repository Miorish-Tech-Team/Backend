# Cloudinary Upload Testing Guide

## Quick Test Commands

### 1. Test Single File Upload (User Profile Photo)
```bash
# Using curl
curl -X PUT http://localhost:8000/api/profile/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profilePhoto=@/path/to/image.jpg" \
  -F "fullName=Test User"
```

### 2. Test Multiple Files (Product Gallery)
```bash
# Using curl
curl -X POST http://localhost:8000/api/seller/products/add \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -F "coverImageUrl=@/path/to/cover.jpg" \
  -F "galleryImageUrls=@/path/to/gallery1.jpg" \
  -F "galleryImageUrls=@/path/to/gallery2.jpg" \
  -F "productName=Test Product" \
  -F "productPrice=100"
```

### 3. Test Server Startup
```bash
cd Backend
npm start
```

Expected output:
- Server should start without errors
- Check console for any Cloudinary-related errors
- Test endpoints should return Cloudinary URLs (format: https://res.cloudinary.com/df4aytnor/...)

## Verification Checklist

- [ ] Server starts without errors
- [ ] Upload endpoint returns Cloudinary URL
- [ ] Images are visible at returned URLs
- [ ] Check Cloudinary dashboard for uploaded images in "miorish" folder

## Expected URL Format

Old Supabase URLs:
```
https://vuxmkjuealwqaincilsy.supabase.co/storage/v1/object/public/miorish/...
```

New Cloudinary URLs:
```
https://res.cloudinary.com/df4aytnor/image/upload/v1234567890/miorish/...
```

## Troubleshooting

### If uploads fail:
1. Verify .env has correct Cloudinary credentials
2. Check cloudinary package is installed: `npm list cloudinary`
3. Check server logs for specific error messages
4. Verify network connectivity to Cloudinary

### If images don't appear:
1. Check returned URL is accessible in browser
2. Verify Cloudinary account is active
3. Check Cloudinary dashboard for uploaded files
4. Ensure folder permissions in Cloudinary

## Support

Check the CLOUDINARY_MIGRATION.md file for complete details about the migration.
