import { Language, AlgorithmType, CodeInfo } from '../types';

// 辅助数组方法代码
const auxiliaryCodes: Record<Language, string> = {
  java: `class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        int[][] matrixNew = new int[n][n];
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                matrixNew[j][n - i - 1] = matrix[i][j];
            }
        }
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                matrix[i][j] = matrixNew[i][j];
            }
        }
    }
}`,
  python: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        matrix_new = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                matrix_new[j][n - i - 1] = matrix[i][j]
        for i in range(n):
            for j in range(n):
                matrix[i][j] = matrix_new[i][j]`,
  golang: `func rotate(matrix [][]int) {
    n := len(matrix)
    matrixNew := make([][]int, n)
    for i := range matrixNew {
        matrixNew[i] = make([]int, n)
    }
    for i := 0; i < n; i++ {
        for j := 0; j < n; j++ {
            matrixNew[j][n-i-1] = matrix[i][j]
        }
    }
    for i := 0; i < n; i++ {
        for j := 0; j < n; j++ {
            matrix[i][j] = matrixNew[i][j]
        }
    }
}`,
  javascript: `var rotate = function(matrix) {
    const n = matrix.length;
    const matrixNew = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            matrixNew[j][n - i - 1] = matrix[i][j];
        }
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            matrix[i][j] = matrixNew[i][j];
        }
    }
};`,
};

// 原地旋转方法代码
const inplaceCodes: Record<Language, string> = {
  java: `class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n / 2; ++i) {
            for (int j = 0; j < (n + 1) / 2; ++j) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[n - j - 1][i];
                matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1];
                matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1];
                matrix[j][n - i - 1] = temp;
            }
        }
    }
}`,
  python: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        for i in range(n // 2):
            for j in range((n + 1) // 2):
                temp = matrix[i][j]
                matrix[i][j] = matrix[n - j - 1][i]
                matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1]
                matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1]
                matrix[j][n - i - 1] = temp`,
  golang: `func rotate(matrix [][]int) {
    n := len(matrix)
    for i := 0; i < n/2; i++ {
        for j := 0; j < (n+1)/2; j++ {
            temp := matrix[i][j]
            matrix[i][j] = matrix[n-j-1][i]
            matrix[n-j-1][i] = matrix[n-i-1][n-j-1]
            matrix[n-i-1][n-j-1] = matrix[j][n-i-1]
            matrix[j][n-i-1] = temp
        }
    }
}`,
  javascript: `var rotate = function(matrix) {
    const n = matrix.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
        for (let j = 0; j < Math.floor((n + 1) / 2); j++) {
            const temp = matrix[i][j];
            matrix[i][j] = matrix[n - j - 1][i];
            matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1];
            matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1];
            matrix[j][n - i - 1] = temp;
        }
    }
};`,
};

// 翻转方法代码
const flipCodes: Record<Language, string> = {
  java: `class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        // 水平翻转
        for (int i = 0; i < n / 2; ++i) {
            for (int j = 0; j < n; ++j) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[n - i - 1][j];
                matrix[n - i - 1][j] = temp;
            }
        }
        // 主对角线翻转
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < i; ++j) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
    }
}`,
  python: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        # 水平翻转
        for i in range(n // 2):
            for j in range(n):
                matrix[i][j], matrix[n - i - 1][j] = \\
                    matrix[n - i - 1][j], matrix[i][j]
        # 主对角线翻转
        for i in range(n):
            for j in range(i):
                matrix[i][j], matrix[j][i] = \\
                    matrix[j][i], matrix[i][j]`,
  golang: `func rotate(matrix [][]int) {
    n := len(matrix)
    // 水平翻转
    for i := 0; i < n/2; i++ {
        for j := 0; j < n; j++ {
            matrix[i][j], matrix[n-i-1][j] = 
                matrix[n-i-1][j], matrix[i][j]
        }
    }
    // 主对角线翻转
    for i := 0; i < n; i++ {
        for j := 0; j < i; j++ {
            matrix[i][j], matrix[j][i] = 
                matrix[j][i], matrix[i][j]
        }
    }
}`,
  javascript: `var rotate = function(matrix) {
    const n = matrix.length;
    // 水平翻转
    for (let i = 0; i < Math.floor(n / 2); i++) {
        for (let j = 0; j < n; j++) {
            [matrix[i][j], matrix[n - i - 1][j]] = 
                [matrix[n - i - 1][j], matrix[i][j]];
        }
    }
    // 主对角线翻转
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
            [matrix[i][j], matrix[j][i]] = 
                [matrix[j][i], matrix[i][j]];
        }
    }
};`,
};

const allCodes: Record<AlgorithmType, Record<Language, string>> = {
  auxiliary: auxiliaryCodes,
  inplace: inplaceCodes,
  flip: flipCodes,
};

export function getCode(algorithm: AlgorithmType, language: Language): CodeInfo {
  const code = allCodes[algorithm][language];
  return {
    language,
    code,
    lineCount: code.split('\n').length,
  };
}

export function getAllCodes(algorithm: AlgorithmType): Record<Language, CodeInfo> {
  const result: Record<Language, CodeInfo> = {} as Record<Language, CodeInfo>;
  const languages: Language[] = ['java', 'python', 'golang', 'javascript'];
  
  for (const lang of languages) {
    result[lang] = getCode(algorithm, lang);
  }
  
  return result;
}
