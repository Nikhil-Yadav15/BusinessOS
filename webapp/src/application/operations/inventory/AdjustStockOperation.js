import { BaseOperation } from '../BaseOperation.js';
import { InventoryRepository } from '../../../persistence/repositories/InventoryRepository.js';
import { StockMovementRepository } from '../../../persistence/repositories/StockMovementRepository.js';
import { DomainEvent } from '../../../infrastructure/events/DomainEvent.js';
import { StockAdjustmentDto } from './dto/StockAdjustmentDto.js';
import { validateDto } from '../../common/ValidationUtils.js';

export class AdjustStockOperation extends BaseOperation {
  async validate(context, input) {
    this.validatedData = validateDto(StockAdjustmentDto, input);
  }

  async perform(context, input, tx) {
    const { businessId, userId } = context;
    if (!businessId || !userId) throw new Error('businessId and userId are required in context');

    const { productId, quantityChange, reason } = this.validatedData;
    if (quantityChange === 0) throw new Error('Adjustment quantity cannot be zero');

    // 1. Manage the Inventory Snapshot
    let inventoryRecord = await InventoryRepository.findByProduct(businessId, productId, tx);
    
    let newQuantity = quantityChange;
    if (inventoryRecord) {
      newQuantity = (parseFloat(inventoryRecord.quantity) + parseFloat(quantityChange));
      
      // Prevent negative stock logic (Optional but standard for V1)
      if (newQuantity < 0) {
        throw new Error('Stock adjustment would result in negative inventory bounds');
      }

      inventoryRecord = await InventoryRepository.update(
        inventoryRecord.id, 
        { quantity: String(newQuantity.toFixed(3)) }, 
        tx
      );
    } else {
      if (quantityChange < 0) {
        throw new Error('Cannot reduce stock for a product that has no inventory record');
      }

      inventoryRecord = await InventoryRepository.create({
        businessId,
        productId,
        quantity: String(newQuantity.toFixed(3)),
        reservedQuantity: '0.000'
      }, tx);
    }

    // 2. Write to Immutable Stock Movement Ledger
    const movement = await StockMovementRepository.create({
      businessId,
      productId,
      movementType: 'ADJUSTMENT',
      quantity: String(quantityChange.toFixed(3)),
      reason: reason,
      createdBy: userId
    }, tx);

    return { inventory: inventoryRecord, movement };
  }

  createEvents(context, result) {
    return [
      DomainEvent.create('inventory.stock.adjusted', {
        businessId: context.businessId,
        productId: this.validatedData.productId,
        quantityChange: this.validatedData.quantityChange,
        newSnapshotQuantity: result.inventory.quantity,
        movementId: result.movement.id
      }, context)
    ];
  }
}
