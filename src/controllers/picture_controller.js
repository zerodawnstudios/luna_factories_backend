import prisma from '../../prisma/client.js';
import { uploadImageToSupabase } from '../utils/supabaseUpload.js';

const get_factory_pictures = async (req, res) => {
  try {
    const { factoryId } = req.params;

    const pictures = await prisma.picture.findMany({
      where: { factoryId: parseInt(factoryId) },
      include: {
        factory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Factory pictures retrieved successfully',
      data: pictures,
    });
  } catch (error) {
    console.error('Error retrieving factory pictures:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve factory pictures',
      error: error.message,
    });
  }
};

const add_factory_pictures = async (req, res) => {
  try {
    const { factoryId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one picture is required',
      });
    }

    // Check if factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: parseInt(factoryId) },
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found',
      });
    }

    // Upload all pictures and create database records
    const picturePromises = req.files.map(async (file) => {
      const pictureUrl = await uploadImageToSupabase(file, 'factory-pictures');
      return prisma.picture.create({
        data: {
          url: pictureUrl,
          factoryId: parseInt(factoryId),
        },
        include: {
          factory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    const pictures = await Promise.all(picturePromises);

    return res.status(201).json({
      success: true,
      message: 'Pictures added successfully',
      data: pictures,
    });
  } catch (error) {
    console.error('Error adding factory pictures:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add factory pictures',
      error: error.message,
    });
  }
};

const get_picture_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    const picture = await prisma.picture.findUnique({
      where: { id: parseInt(id) },
      include: {
        factory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!picture) {
      return res.status(404).json({
        success: false,
        message: 'Picture not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Picture retrieved successfully',
      data: picture,
    });
  } catch (error) {
    console.error('Error retrieving picture:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve picture',
      error: error.message,
    });
  }
};

const delete_factory_picture = async (req, res) => {
  try {
    const { factoryId, pictureId } = req.params;

    // Verify the picture belongs to the factory
    const picture = await prisma.picture.findFirst({
      where: {
        id: parseInt(pictureId),
        factoryId: parseInt(factoryId),
      },
    });

    if (!picture) {
      return res.status(404).json({
        success: false,
        message: 'Picture not found or does not belong to this factory',
      });
    }

    await prisma.picture.delete({
      where: {
        id: parseInt(pictureId),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Picture deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting factory picture:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete factory picture',
      error: error.message,
    });
  }
};

const delete_picture = async (req, res) => {
  try {
    const { id } = req.params;

    const picture = await prisma.picture.findUnique({
      where: { id: parseInt(id) },
    });

    if (!picture) {
      return res.status(404).json({
        success: false,
        message: 'Picture not found',
      });
    }

    await prisma.picture.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: 'Picture deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting picture:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete picture',
      error: error.message,
    });
  }
};

export default {
  get_factory_pictures,
  add_factory_pictures,
  get_picture_by_id,
  delete_factory_picture,
  delete_picture,
};
