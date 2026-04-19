// src/utils/cloudinary.ts

export const uploadToCloudinary = async (imageUri: string): Promise<string> => {
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;

  try {
    const data = new FormData();

    // React Native requires uri, type, and name for file uploads
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar_upload.jpg",
    } as any);

    data.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
        // Explicitly defining headers helps prevent network request failures in React Native
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const result = await response.json();

    if (result.secure_url) {
      // ✨ The Magic: Injecting the AI face-crop and compression transformations
      const optimizedUrl = result.secure_url.replace(
        "/upload/",
        "/upload/w_200,h_200,c_fill,g_face,q_auto/", // Added q_auto for automatic compression!
      );

      return optimizedUrl;
    } else {
      throw new Error(
        result.error?.message || "Failed to get secure URL from Cloudinary",
      );
    }
  } catch (error) {
    console.error("🔥 Cloudinary Upload Error:", error);
    throw error;
  }
};
