import Joi from "joi";

export const findRestaurantByRestaurantIdSchema = Joi.object({
    restaurantId: Joi.string().required(),
})

export const createRestaurantSchema = Joi.object({
    managerId: Joi.string().required(),
    // addressId:Joi.string().required(),
    restaurantName: Joi.string().min(1).required(),
    restaurantBio: Joi.string().required(),
    restaurantLogo: Joi.string().required(),
    isAvailable: Joi.boolean().required(),
    // restaurantPhone:Joi.string().required(),
}).required();

export const updateRestaurantRatingSchema = Joi.object({
    restaurantId: Joi.string().required(),
    averageRating: Joi.number().integer().min(1).max(5).required(),
    ratingCount: Joi.number().integer().min(1).required(),
}).required();

export const searchRestaurantSchema = Joi.object({
    query: Joi.object().keys({
        restaurantName: Joi.string().min(1).trim().optional(),
    })
}).required();

export const enableOrDisableRestaurantSchema = Joi.object({
    restaurantId: Joi.string().required(),
}).required();

export const deleteRestaurantSchema = Joi.object({
    restaurantId: Joi.string().required(),
}).required();

export const updateRestaurantSchema = Joi.object({
    body: Joi.object().required()
})

// export const searchMenuItemSchema = {
//     query:Joi.object().keys({
//        menuItemName:Joi.string().min(1).trim().optional() ,
//        menuItemDesc:Joi.string().optional(),
//        minPrice:Joi.number().integer().min(1).optional(),
//        maxPrice:Joi.number().integer().min(1).optional().when('minPrice',{
//         is:Joi.exist(),
//         then:Joi.number().integer().min(Joi.ref('minPrice'))
//        }),
//     })
// }
