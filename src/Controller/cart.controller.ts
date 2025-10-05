import { Router } from 'express';
export const cartRouter = Router();
 // view cart
cartRouter.get('/view', (req, res) => {
  /**
   * #swagger.tags = ['Cart']
   * #swagger.summary = 'Customer view cart'
   * #swagger.responses[200] = { description: 'Customer View cart successfully' }
   * #swagger.responses[400] = { description: 'Cart not found' }
   */
  res.status(200).send("Customer View cart successfully");
});


 // modify cart add , delete
cartRouter.put('/modify', (req, res) => {
  /**
   * #swagger.tags = ['Cart']
   * #swagger.summary = 'Customer modify cart'
   * #swagger.parameters['body'] = {
         in: 'body',
         description: 'Cart data to modify',
         required: true,
         schema: {
             type: 'object',
             properties: {
                 customerId: { type: 'integer', description: 'ID of the customer' },
                 Action: { type: {'enum': ["add","remove"] }} ,     
                 cartItem: {
                     type: 'object',
                     description: 'Cart item details',
                     properties: {
                         cartItem: { type: 'string', description: 'item ID ' },
                         quantity: { type: 'integer', description: 'Quantity of the item' }
                     },
                     required: ['cartItem' ]
                 }
             },
             required: ['customerId', 'cartItem' , 'Action']
         }
     }
   * #swagger.responses[200] = { description: 'Cart modified successfully' }
   * #swagger.responses[400] = { description: 'Cart not found' }
   * #swagger.responses[404] = { description: 'Bad Request : Invlid date' }
   * #swagger.responses[500] = { description: 'Internal Server error' }

   */
  res.status(200).send("Cart modified successfully");
});

