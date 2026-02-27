import { Injectable } from '@nestjs/common';

@Injectable()
export class AssuranceOptionIdsValidator {
  normalizeOptionIds(optionIds?: string | string[]): string[] {
    if (!optionIds) {
      return [];
    }
    return Array.isArray(optionIds) ? optionIds : [optionIds];
  }
}
