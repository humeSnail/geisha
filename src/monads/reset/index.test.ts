import Geisha from '../../geisha';
import { ResetGenerator } from './index';
import { MapGenerator } from '../map';

describe('ResetGenerator', () => {
    test('返回变量', () => {
        let res;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            res = data;
            return res;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            return 2;
        });
        const resetWrap = ResetGenerator(spyFn);

        resetWrap(1, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();
        expect(res).toBe(2);

        /**
         * 初始值为error的情况
         */
        spyNextFn.mockClear();
        spyFn.mockClear();

        resetWrap(new Error('a error'), spyNextFn);
        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();
        expect(res).toBe(2);
    });

    test('返回Promise', (done) => {
        let res;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            res = data;
            return res;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            return Promise.resolve(2);
        });
        const resetWrap = ResetGenerator(spyFn);

        resetWrap(1, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(res).toBe(2);
            done();
        });
    });

    test('返回Promise，Promise内部出错的情况', (done) => {
        let res;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            res = data;
            return res;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            return new Promise(() => {
                throw new Error('promise internal error');
            });
        });
        const resetWrap = ResetGenerator(spyFn);

        resetWrap(1, spyNextFn);

        setTimeout(() => {
            expect(spyNextFn).toHaveBeenCalled();
            expect(spyFn).toHaveBeenCalled();
            expect(res).toBeInstanceOf(Error);
            expect(res.message).toBe('promise internal error');
            done();
        });
    });

    test('fn出错的情况', () => {
        let res;
        const spyNextFn = jest.fn().mockImplementation((data) => {
            res = data;
            return res;
        });
        const spyFn = jest.fn().mockImplementation((_) => {
            throw new Error('a error');
        });
        const resetWrap = ResetGenerator(spyFn);

        resetWrap(1, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();
        expect(res).toBeInstanceOf(Error);
        expect(res.message).toBe('a error');
    });

    test('集成Geisha', () => {
        let res;
        const mapFnA = jest.fn().mockImplementation((data) => {
            return data + data;
        });
        const mapFnB = jest.fn().mockImplementation((data) => {
            res = data;
            return res;
        });
        const restFn = jest.fn().mockImplementation((_) => {
            return 3;
        });

        new Geisha()
            .pipe(MapGenerator(mapFnA), ResetGenerator(restFn), MapGenerator(mapFnB))
            .invoke(1);

        expect(mapFnA).toHaveBeenCalled();
        expect(mapFnB).toHaveBeenCalled();
        expect(restFn).toHaveBeenCalled();
        expect(res).toBe(3);

        /**
         * 某一个环节出错的情况
         */
        mapFnA.mockClear();
        mapFnB.mockClear();
        restFn.mockClear();
        res = '';

        const mapFnC = jest.fn().mockImplementation((_) => {
            throw new Error('throw by mapFnC');
        });

        new Geisha()
            .pipe(
                MapGenerator(mapFnA),
                MapGenerator(mapFnC),
                ResetGenerator(restFn),
                MapGenerator(mapFnB)
            )
            .invoke(1);

        expect(mapFnA).toHaveBeenCalled();
        expect(mapFnB).toHaveBeenCalled();
        expect(mapFnC).toHaveBeenCalled();
        expect(restFn).toHaveBeenCalled();
        expect(res).toBe(3);
    });
});
