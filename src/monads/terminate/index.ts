import { isPromise } from '../../utils/isPromise';
import { TMonadGenerator } from '../../types/monad';

export const TerminateGenerator = <R1>(
    fn: (data: R1 | Error) => boolean | Promise<boolean>
): ReturnType<TMonadGenerator<R1, R1>> => {
    return (data: R1 | Error, next: (data: R1 | Error) => void) => {
        try {
            let res = fn(data);
            if (!isPromise(res)) {
                if (!res) {
                    next(data);
                }
            } else {
                res.then((res) => {
                    if (!res) {
                        next(data);
                    }
                }).catch(() => {
                    next(data);
                });
            }
        } catch (e) {
            next(data);
        }
    };
};
