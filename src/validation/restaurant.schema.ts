import Joi from "joi";

export const searchMenuItemSchema = {
    query:Joi.object().keys({
       menuItemName:Joi.string().min(1).trim().optional() , 
       menuItemDesc:Joi.string().optional(),
       minPrice:Joi.number().integer().min(1).optional(),
       maxPrice:Joi.number().integer().min(1).optional().when('minPrice',{
        is:Joi.exist(),
        then:Joi.number().integer().min(Joi.ref('minPrice'))
       }),    
    })
}
export const getRestaurantSchema = {
    params:Joi.object().keys({
        restaurantId : Joi.string().required()
    })
} 