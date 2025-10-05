import { Router } from "express";
export const cartRouter = Router();
/**
 * @swagger
 * /cart/view:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Customer view cart
 *     responses:
 *       200:
 *         description: Customer View cart successfully
 *       400:
 *         description: Cart not found
 */
cartRouter.get("/view", (req, res) => {
  res.status(200).send("Customer View cart successfully");
});

/**
 * @swagger
 * /cart/modify:
 *   put:
 *     tags:
 *       - Cart
 *     summary: Customer modify cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: integer
 *                 description: ID of the cart
 *               customerId:
 *                 type: integer
 *                 description: ID of the customer
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *               quantity:
 *                     type: integer
 *                     description: Quantity of the item
 *             required:
 *               - customerId
 *               - cartItem
 *               - action
 *     responses:
 *       200:
 *         description: Cart modified successfully
 *       404:
 *         description: Cart not found
 *       400:
 *         description: "Bad Request: Invalid data"
 *       500:
 *         description: Internal Server error
 */
cartRouter.put("/modify", (req, res) => {
  res.status(200).send("Cart modified successfully");
});

/**
 * @swagger
 * /cart/{itemId}/update-quantity:
 *   put:
 *     tags:
 *       - Cart
 *     summary: Update the quantity of an item in the cart
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               cartId:
 *                 type: string
 *             required:
 *              - cartId
 *              - quantity
 *             example:
 *               cartId: "abc123"
 *               quantity: 3
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Item quantity updated successfully
 */
cartRouter.put("cart/:itemId/update-quantity", (req, res) => {
  res.json({ message: "Item quantity updated successfully" });
});

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Clear the shopping cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: string
 *             required:
 *               - cartId
 *             example:
 *               cartId: "abc123"
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Cart has been cleared successfully
 */
cartRouter.delete("cart/clear", (req, res) => {
  res.json({ message: "Cart has been cleared successfully" });
});
