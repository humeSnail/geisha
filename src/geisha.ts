/*
 * @Author: chonger
 * @Date: 2021-08-26 14:09:25
 * @Last Modified by: chonger
 * @Last Modified time: 2022-02-21 18:31:23
 */
import { TMonad, TMonadGenerator } from './types/monad';
import { IdentityGenerator as identity } from './monads/identity';
import { isError } from './utils/isError';
class Geisha {
    private _monads: TMonad[] = [];
    private _iteratorIndex = 0;

    pipe(): this;
    pipe<T, A>(m1: ReturnType<TMonadGenerator<T, A>>): this;
    pipe<T, A, B>(
        m1: ReturnType<TMonadGenerator<T, A>>,
        m2: ReturnType<TMonadGenerator<A, B>>
    ): this;
    pipe<T, A, B, C>(
        m1: ReturnType<TMonadGenerator<T, A>>,
        m2: ReturnType<TMonadGenerator<A, B>>,
        m3: ReturnType<TMonadGenerator<B, C>>
    ): this;
    pipe<T, A, B, C, D>(
        m1: ReturnType<TMonadGenerator<T, A>>,
        m2: ReturnType<TMonadGenerator<A, B>>,
        m3: ReturnType<TMonadGenerator<B, C>>,
        m4: ReturnType<TMonadGenerator<C, D>>
    ): this;
    pipe<T, A, B, C, D, E>(
        m1: ReturnType<TMonadGenerator<T, A>>,
        m2: ReturnType<TMonadGenerator<A, B>>,
        m3: ReturnType<TMonadGenerator<B, C>>,
        m4: ReturnType<TMonadGenerator<C, D>>,
        m5: ReturnType<TMonadGenerator<D, E>>
    ): this;
    pipe<T, A, B, C, D, E, F>(
        m1: ReturnType<TMonadGenerator<T, A>>,
        m2: ReturnType<TMonadGenerator<A, B>>,
        m3: ReturnType<TMonadGenerator<B, C>>,
        m4: ReturnType<TMonadGenerator<C, D>>,
        m5: ReturnType<TMonadGenerator<D, E>>,
        m6: ReturnType<TMonadGenerator<E, F>>
    ): this;
    pipe<T, A, B, C, D, E, F, G>(
        m1: ReturnType<TMonadGenerator<T, A>>,
        m2: ReturnType<TMonadGenerator<A, B>>,
        m3: ReturnType<TMonadGenerator<B, C>>,
        m4: ReturnType<TMonadGenerator<C, D>>,
        m5: ReturnType<TMonadGenerator<D, E>>,
        m6: ReturnType<TMonadGenerator<E, F>>,
        m7: ReturnType<TMonadGenerator<F, G>>
    ): this;
    pipe<T, A, B, C, D, E, F, G>(
        m1: ReturnType<TMonadGenerator<T, A>>,
        m2: ReturnType<TMonadGenerator<A, B>>,
        m3: ReturnType<TMonadGenerator<B, C>>,
        m4: ReturnType<TMonadGenerator<C, D>>,
        m5: ReturnType<TMonadGenerator<D, E>>,
        m6: ReturnType<TMonadGenerator<E, F>>,
        m7: ReturnType<TMonadGenerator<F, G>>
    ): this;
    pipe<T, A, B, C, D, E, F, G>(...monads: ReturnType<TMonadGenerator<any, any>>[]): this;
    pipe(...monads: ReturnType<TMonadGenerator<any, any>>[]) {
        [...monads].forEach((monad) => {
            this._monads.push(monad);
        });
        return this;
    }

    invoke = <T, U>(data?: T): Promise<U> => {
        return new Promise((resolve, reject) => {
            this.reset();
            this.pipe(
                identity((data) => {
                    if (isError(data)) {
                        reject(data);
                    } else {
                        resolve(data);
                    }
                })
            );
            this.next(data);
        });
    };

    private reset = () => {
        this._iteratorIndex = 0;
    };

    private next = <T>(data: T | Error) => {
        if (this._iteratorIndex < this._monads.length) {
            this._monads[this._iteratorIndex++](data, this.next);
        }
    };
}

export default Geisha;
