import { Router } from "express";
const router = Router();

/**
 * @swagger
 * /cart/{item_id}/update-quantity:
 *   put:
 *     summary: Update the quantity of an item in the cart
 *     parameters:
 *       - in: path
 *         name: item_id
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
 *                 example: 5
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
router.put("cart/:item_id/update-quantity", (req, res) => {
  res.json({ message: "Item quantity updated successfully" });
});

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *      summary: Clear the shopping cart
 *      responses:
 *          200:
 *              description: Cart cleared successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                          example: Cart has been cleared successfully
 */
router.delete("cart/clear", (req, res) => {
  res.json({ message: "Cart has been cleared successfully" });
});

export default router;
