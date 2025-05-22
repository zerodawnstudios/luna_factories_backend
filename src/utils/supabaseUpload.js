import { supabase } from '../config/supabaseClient.js';

const uploadImageToSupabase = async (file, folderName = 'photographers') => {
  const fileName = `${folderName}/${file.originalname}-${Date.now()}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file.buffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data: publicUrlData, error: urlError } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  if (urlError || !publicUrlData?.publicUrl) {
    throw new Error('Failed to get public URL');
  }
  return publicUrlData.publicUrl;
};

export { uploadImageToSupabase };
