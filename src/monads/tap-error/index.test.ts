import Geisha from '../../geisha';
import { MapGenerator } from '../map';
import { AsyncMapGenerator } from '../async-map';
import { TapErrorGenerator } from './index';

describe('MapGenerator', () => {
    test('参数不为Error的情况', () => {
        const spyNextFn = jest.fn().mockImplementation((data) => data);
        const spyFn = jest.fn().mockImplementation((data) => data);
        const tapErrorWrap = TapErrorGenerator(spyFn);

        tapErrorWrap(2, spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).not.toHaveBeenCalled();
    });

    test('参数为Error的情况', () => {
        let fnParams;
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data: number) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((data: number) => {
            fnParams = data;
            return data + data;
        });
        const tapErrorWrap = TapErrorGenerator(spyFn);

        tapErrorWrap(new Error('a error'), spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();

        expect(nextParams).toBeInstanceOf(Error);
        expect(fnParams).toBeInstanceOf(Error);
        // @ts-ignore
        expect(fnParams.message).toBe('a error');
        // @ts-ignore
        expect(nextParams.message).toBe('a error');
    });

    test('fn出错的情况', () => {
        let nextParams;
        const spyNextFn = jest.fn().mockImplementation((data: number) => {
            nextParams = data;
        });
        const spyFn = jest.fn().mockImplementation((_: number) => {
            throw new Error('a error');
        });
        const tapErrorWrap = TapErrorGenerator(spyFn);

        tapErrorWrap(new Error('inital error'), spyNextFn);

        expect(spyNextFn).toHaveBeenCalled();
        expect(spyFn).toHaveBeenCalled();

        expect(nextParams).toBeInstanceOf(Error);

        // @ts-ignore
        expect(nextParams.message).toBe('a error');
    });

    test('集成Geisha', () => {
        const mockFnA = jest.fn().mockImplementation(() => 1);
        const mockFnB = jest.fn().mockImplementation((data: number) => data + data);
        const mockFnC = jest.fn().mockImplementation((data: number) => data);

        const mockAsyncMapFnA = jest
            .fn()
            .mockImplementation((data: number) => Promise.resolve(data * 2));

        const mockTapErrorFnA = jest.fn().mockImplementation((data: number) => data);
        const mockTapErrorFnB = jest.fn().mockImplementation((data: number) => data);

        const geisha = new Geisha();
        let result;

        geisha
            .pipe(
                MapGenerator(mockFnA),
                MapGenerator(mockFnB),
                AsyncMapGenerator(mockAsyncMapFnA),
                TapErrorGenerator(mockTapErrorFnA),
                MapGenerator((data) => {
                    result = data;
                    throw new Error('a error');
                }),
                TapErrorGenerator(mockTapErrorFnB),
                MapGenerator(mockFnC)
            )
            .invoke()
            .finally(() => {
                expect(result).toBe(4);
                expect(mockFnA).toHaveBeenCalled();
                expect(mockFnB).toHaveBeenCalled();
                expect(mockTapErrorFnA).not.toHaveBeenCalled();
                expect(mockTapErrorFnB).toHaveBeenCalled();
                expect(mockFnC).not.toHaveBeenCalled();
            });
    });
});
