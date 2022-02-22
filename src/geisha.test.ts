import Geisha from './geisha';
import { MapGenerator } from './monads/map';

describe('Geisha基础功能', () => {
  test('pipe正常的情况', () => {
    const mockFnA = jest.fn().mockImplementation(() => 1);
    const mockFnB = jest.fn().mockImplementation((data: number) => data + data);

    const geisha = new Geisha();
    let result;

    geisha
      .pipe(
        MapGenerator(mockFnA),
        MapGenerator(mockFnB),
        MapGenerator((data: number) => {
          result = data;
        }),
      )
      .invoke();

    expect(result).toBe(2);
    expect(mockFnA).toHaveBeenCalled();
    expect(mockFnB).toHaveBeenCalled();
  });

  test('invoke正常传参的情况', () => {
    const mockFnA = jest.fn().mockImplementation((data: number) => data + data);
    const mockFnB = jest.fn().mockImplementation((data: number) => data * data);

    const geisha = new Geisha();
    let result;

    geisha
      .pipe(
        MapGenerator(mockFnA),
        MapGenerator(mockFnB),
        MapGenerator((data: number) => {
          result = data;
        }),
      )
      .invoke(2);

    expect(result).toBe(16);
    expect(mockFnA).toHaveBeenCalled();
    expect(mockFnB).toHaveBeenCalled();
  });

  test('monad出错的情况', () => {
    const mockFnA = jest.fn().mockImplementation((data: number) => data + data);
    const mockFnB = jest.fn().mockImplementation((data: number) => data * data);

    const geisha = new Geisha();
    let result;

    geisha
      .pipe(
        MapGenerator(() => {
          throw new Error('a error');
        }),
        MapGenerator(mockFnA),
        MapGenerator(mockFnB),
        MapGenerator((data: number) => {
          result = data;
        }),
      )
      .invoke(2);

    expect(result).toBe(undefined);
    expect(mockFnA).not.toHaveBeenCalled();
    expect(mockFnB).not.toHaveBeenCalled();

    const geisha2 = new Geisha();
    let result2;

    geisha2
      .pipe(
        MapGenerator(mockFnA),
        MapGenerator(() => {
          throw new Error('a error');
        }),
        MapGenerator(mockFnB),
        MapGenerator((data: number) => {
          result2 = data;
        }),
      )
      .invoke(2);

    expect(result2).toBe(undefined);
    expect(mockFnA).toHaveBeenCalled();
    expect(mockFnB).not.toHaveBeenCalled();
  });
});

describe('invoke返回promise', () => {
  test('运行无error', async () => {
    const res = await new Geisha()
      .pipe(
        MapGenerator((data: number) => {
          return data + data;
        }),
        MapGenerator(data => {
          return data * data;
        }),
      )
      .invoke(1);

    expect(res).toBe(4);
  });

  test('运行有Error', () => {
    new Geisha()
      .pipe(
        MapGenerator((data: number) => {
          return data + data;
        }),
        MapGenerator(data => {
          return data * data;
        }),
        MapGenerator(data => {
          throw new Error(String(data));
        }),
      )
      .invoke(1)
      .catch(e => {
        expect(e.message).toBe('4');
      });
  });
});
