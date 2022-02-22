import { isPromise } from '../../utils/isPromise';
import { TMonadGenerator } from '../../types/monad';

export const ResetGenerator = <R1, R2>(
    fn: (data: R1) => R2 | Promise<R2>
): ReturnType<TMonadGenerator<R1, R2>> => {
    return (data: R1, next: (data: R2) => void) => {
        try {
            let res = fn(data);
            if (!isPromise(res)) {
                next(res);
            } else {
                res.then((res) => {
                    next(res);
                }).catch((e) => {
                    next(e);
                });
            }
        } catch (e) {
            next(e);
        }
    };
};
