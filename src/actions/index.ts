import { uppercaseAction } from './uppercase';
import { reverseAction } from './reverse';
import { addTimestampAction } from './addTimestamp';

export const actionRegistry: Record<string, (payload: any) => Promise<any>> = {
  uppercase: uppercaseAction,
  reverse: reverseAction,
  addTimestamp: addTimestampAction,
};

export { uppercaseAction, reverseAction, addTimestampAction };