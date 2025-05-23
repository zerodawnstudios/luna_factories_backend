import prisma from '../../prisma/client.js';
import { uploadImageToSupabase } from '../utils/supabaseUpload.js';

const create_factory = async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      phone,
      email,
      certification,
      productionCapacity,
      description,
      recommendedReason,
      videoLink,
      status,
      categoryId,
    } = req.body;

    const mainImageUrl = await uploadImageToSupabase(req.file, 'factories');

    if (!name || !location || !address || !categoryId || !mainImageUrl) {
      return res.status(400).json({
        success: false,
        message:
          'Name, location, address, categoryId, and main image are required fields',
      });
    }

    // Create new factory
    const factory = await prisma.factory.create({
      data: {
        name,
        location,
        address,
        phone,
        email,
        certification,
        productionCapacity,
        description,
        recommendedReason,
        videoLink,
        mainImage: mainImageUrl,
        status: status || 'active',
        categoryId: parseInt(categoryId),
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Factory created successfully',
      data: factory,
    });
  } catch (error) {
    console.error('Error creating factory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create factory',
      error: error.message,
    });
  }
};

const update_factory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      address,
      phone,
      email,
      certification,
      productionCapacity,
      description,
      recommendedReason,
      videoLink,
      status,
      categoryId,
    } = req.body;

    const mainImageUrl = req.file
      ? await uploadImageToSupabase(req.file, 'factories')
      : undefined;

    // Prepare update data
    const updateData = {
      name,
      location,
      address,
      phone,
      email,
      certification,
      productionCapacity,
      description,
      recommendedReason,
      videoLink,
      status,
    };

    // Add categoryId if provided
    if (categoryId) {
      updateData.categoryId = parseInt(categoryId);
    }

    // Only add mainImage if a new file was uploaded
    if (mainImageUrl) {
      updateData.mainImage = mainImageUrl;
    }

    // Update factory
    const factory = await prisma.factory.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Factory updated successfully',
      data: factory,
    });
  } catch (error) {
    console.error('Error updating factory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update factory',
      error: error.message,
    });
  }
};

const get_factories = async (req, res) => {
  try {
    const {
      page,
      filter,
      pageSize: querySizeParam,
      search,
      status,
      location,
    } = req.query;

    // Default pagination values with configurable page size
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(querySizeParam) || 12;
    const skip = (pageNumber - 1) * pageSize;

    // Build query object based on filters
    const query = {};

    // Add category filter if provided
    if (filter) {
      query.categoryId = parseInt(filter);
    }

    // Add name search if provided
    if (search) {
      query.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add location filter if provided
    if (location) {
      query.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Get total count for pagination metadata
    const totalCount = await prisma.factory.count({ where: query });

    // Get factories with pagination, filtering, and search
    const factories = await prisma.factory.findMany({
      where: query,
      skip,
      take: pageSize,
      include: {
        category: true,
        products: true,
        pictures: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Factories retrieved successfully',
      data: factories,
      pagination: {
        page: pageNumber,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: pageNumber < Math.ceil(totalCount / pageSize),
        hasPrevious: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Error retrieving factories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve factories',
      error: error.message,
    });
  }
};

const get_factory_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    const factory = await prisma.factory.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        products: true,
        pictures: true,
      },
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Factory retrieved successfully',
      data: factory,
    });
  } catch (error) {
    console.error('Error retrieving factory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve factory',
      error: error.message,
    });
  }
};

const delete_factory = async (req, res) => {
  try {
    const { id } = req.params;

    const factory = await prisma.factory.findUnique({
      where: { id: parseInt(id) },
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found',
      });
    }

    // Delete factory (cascade will handle related products and pictures)
    await prisma.factory.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: 'Factory deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting factory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete factory',
      error: error.message,
    });
  }
};

const get_factory_categories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Factory categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error retrieving factory categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve factory categories',
      error: error.message,
    });
  }
};

const get_factory_products = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await prisma.product.findMany({
      where: { factoryId: parseInt(id) },
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
      message: 'Factory products retrieved successfully',
      data: products,
    });
  } catch (error) {
    console.error('Error retrieving factory products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve factory products',
      error: error.message,
    });
  }
};

const get_factory_pictures = async (req, res) => {
  try {
    const { id } = req.params;

    const pictures = await prisma.picture.findMany({
      where: { factoryId: parseInt(id) },
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

const add_factory_product = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required fields',
      });
    }

    // Check if factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: parseInt(id) },
    });

    if (!factory) {
      return res.status(404).json({
        success: false,
        message: 'Factory not found',
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        factoryId: parseInt(id),
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

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error adding factory product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add factory product',
      error: error.message,
    });
  }
};

const update_factory_product = async (req, res) => {
  try {
    const { factoryId, productId } = req.params;
    const { name, price } = req.body;

    const product = await prisma.product.update({
      where: {
        id: parseInt(productId),
        factoryId: parseInt(factoryId),
      },
      data: {
        name,
        price: parseFloat(price),
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

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating factory product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update factory product',
      error: error.message,
    });
  }
};

const delete_factory_product = async (req, res) => {
  try {
    const { factoryId, productId } = req.params;

    await prisma.product.delete({
      where: {
        id: parseInt(productId),
        factoryId: parseInt(factoryId),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting factory product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete factory product',
      error: error.message,
    });
  }
};

const add_factory_pictures = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one picture is required',
      });
    }

    // Check if factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: parseInt(id) },
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
          factoryId: parseInt(id),
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

const delete_factory_picture = async (req, res) => {
  try {
    const { factoryId, pictureId } = req.params;

    await prisma.picture.delete({
      where: {
        id: parseInt(pictureId),
        factoryId: parseInt(factoryId),
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

export default {
  create_factory,
  update_factory,
  get_factories,
  get_factory_by_id,
  delete_factory,
  get_factory_categories,
  get_factory_products,
  get_factory_pictures,
  add_factory_product,
  update_factory_product,
  delete_factory_product,
  add_factory_pictures,
  delete_factory_picture,
};
