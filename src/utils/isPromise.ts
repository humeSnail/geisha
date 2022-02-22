import { isFunction } from './isFunction';

export function isPromise(value: any): value is PromiseLike<any> {
    return isFunction(value.then);
}
