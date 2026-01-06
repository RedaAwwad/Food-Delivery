import Joi from "joi";

export const findRestaurantByRestaurantIdSchema = {
    body:Joi.object().required().keys({
        restaurantId:Joi.string().required(),
    })
}

export const createRestaurantSchema = {
    body:Joi.object().required().keys({
        managerId:Joi.string().required(), 
        addressId:Joi.string().required(),
        restaurantName:Joi.string().min(1).required(),
        restaurantBio:Joi.string().required(),
        restaurantLogo:Joi.string().required(),
        // restaurantPhone:Joi.string().required(),
    })
}

export const updateRestaurantRatingSchema = {
    body:Joi.object().required().keys({
        restaurantId:Joi.string().required(),
        averageRating:Joi.number().integer().min(1).max(5).required(),
        ratingCount:Joi.number().integer().min(1).required(),
    })
}

export const searchRestaurantSchema = {
    query:Joi.object().keys({
        restaurantName:Joi.string().min(1).trim().optional() , 
    })
}

export const enableOrDisableRestaurantSchema = {
    body:Joi.object().required().keys({
        restaurantId:Joi.string().required(),
    })
}

export const deleteRestaurantSchema = {
    body:Joi.object().required().keys({
        restaurantId:Joi.string().required(),
    })
}

export const updateRestaurantSchema = {
    body:Joi.object().required()
}

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
