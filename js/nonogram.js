class Nonogram {

    constructor(rowNum, colNum, rowHints, columnHints) {

        // check required parameters
        if (!rowNum || !colNum || !rowHints || !columnHints) {
            throw new Error('Required parameters are missing');
        }

        // rowNum and colNum must be a number
        if (typeof rowNum !== 'number' || typeof colNum !== 'number') {
            throw new Error('Row number and column number must be a number');
        }

        // rowHints and columnHints must be an array
        if (!Array.isArray(rowHints) || !Array.isArray(columnHints)) {
            throw new Error('Row hints and column hints must be an array');
        }

        // rowHints and columnHints must be an array of array
        if (!rowHints.every(Array.isArray) || !columnHints.every(Array.isArray)) {
            throw new Error('Row hints and column hints must be an array of array');
        }

        // rowHints and columnHints must be an array of array of number
        if (!rowHints.every(hint => hint.every(Number.isInteger)) || !columnHints.every(hint => hint.every(Number.isInteger))) {
            throw new Error('Row hints and column hints must be an array of array of number');
        }

        this.rowNum = rowNum;
        this.colNum = colNum;
        this.grid = this.createGrid();
        this.rowHints = rowHints;
        this.columnHints = columnHints;
    }

    createGrid() {
        const grid = [];
        for (let i = 0; i < this.rows; i++) {
            grid.push(Array(this.columns).fill(0));
        }
        return grid;
    }

    async isValidHints() {
        // Your validation logic goes here
        const result = {
            isValid: true,
            notValidReason: '',
        };

        // 행 힌트의 수와 행의 수가 다른 경우 (힌트가 없더라도 빈 배열이라도 존재해야 한다.)
        if (this.rowNum !== this.rowHints.length) {
            result.isValid = false;
            result.notValidReason = 'Row hints length ['+(this.rowHints.length)+'] is not equal to row number ['+(this.rowNum)+']';
            return result;
        }

        // 열 힌트의 수와 열의 수가 다른 경우 (힌트가 없더라도 빈 배열이라도 존재해야 한다.)
        if (this.colNum !== this.columnHints.length) {
            result.isValid = false;
            result.notValidReason = 'Column hints length ['+(this.columnHints.length)+'] is not equal to column number ['+(this.colNum)+']';
            return result;
        }

        // 행 힌트의 각 합은 열의 수보다 작거나 같아야 한다.
        // 또한 힌트가 2개 이상인 경우 힌트사이에 최소 1칸의 공백이 있어야 하므로
        // 힌트의 합산을 더할때 (힌트의 수 - 1)을 더해준다.
        let rowHintsSum = 0;
        let rowPureHintsSum = 0;
        for (let i = 0; i < this.rowNum; i++) {
            const rowHints = this.rowHints[i];
            const rowHintsLength = rowHints.length;
            for (let j = 0; j < rowHintsLength; j++) {
                rowHintsSum += rowHints[j];
                rowPureHintsSum += rowHints[j];
            }
            if (rowHintsSum + rowHintsLength - 1 > this.colNum) {
                result.isValid = false;
                result.notValidReason = ' ['+(i+1)+'] 번째 행 sum is greater than '+this.colNum;
                return result;
            }
            rowHintsSum = 0;
        }

        // 열 힌트의 각 합은 행의 수보다 작거나 같아야 한다.
        // 또한 힌트가 2개 이상인 경우 힌트사이에 최소 1칸의 공백이 있어야 하므로
        // 힌트의 합산을 더할때 (힌트의 수 - 1)을 더해준다.
        let columnHintsSum = 0;
        let columnPureHintsSum = 0;
        for (let i = 0; i < this.colNum; i++) {
            const columnHints = this.columnHints[i];
            const columnHintsLength = columnHints.length;
            for (let j = 0; j < columnHintsLength; j++) {
                columnHintsSum += columnHints[j];
                columnPureHintsSum += columnHints[j];
            }
            if (columnHintsSum + columnHintsLength - 1 > this.rowNum) {
                result.isValid = false;
                result.notValidReason = ' ['+(i+1)+'] 번째 열 sum is greater than '+this.rowNum;
                return result;
            }
            columnHintsSum = 0;
        }

        // 행과 열의 힌트는 행과 열 기준으로 칠해지는 칸의 수를 의미한다.
        // 따라서, 행의 힌트의 합과 열의 힌트의 합은 같아야 한다.
        if (rowPureHintsSum !== columnPureHintsSum) {
            result.isValid = false;
            result.notValidReason = 'Row hints sum ['+(rowPureHintsSum)+'] is not equal to column hints sum ['+(columnPureHintsSum)+']';
            return result;
        }       

        return result;
    }

    async solve () {
        // Your nonogram solving logic goes here
        const result = {
            solved: false,
            answer: [],
        };

        return result;
    }

    async isValidAnswer(answer) {
        // row check
        for (let i = 0; i < this.rows; i++) {
            const row = answer[i];
            const rowHints = this.rowHints[i];
            const rowCheck = this.check(row, rowHints);
            if (!rowCheck) {
                return false;
            }
        }
        // column check
        for (let i = 0; i < this.columns; i++) {
            const column = [];
            for (let j = 0; j < this.rows; j++) {
                column.push(answer[j][i]);
            }
            const columnHints = this.columnHints[i];
            const columnCheck = this.check(column, columnHints);
            if (!columnCheck) {
                return false;
            }
        }
    }

    /**
     * @function check 
     * @description 행 또는 열의 힌트와 답을 비교하여 정답인지 확인한다.
     * @param {Array<number>} row 
     * @example row = [1, 0, 1, 1, 1, 1, 0, 1]
     * @param {Array<number>} rowHints 
     * @example row = [1, 4, 1]
     * @returns {boolean}
     * @example true
     */
    check(row, rowHints) {
        const rowLength = row.length;
        let rowHintsIndex = 0;
        let rowHintsCount = 0;
        let rowHintsSum = 0;
        let rowHintsSumCount = 0;
        for (let i = 0; i < rowLength; i++) {
            if (row[i] === 1) {
                // 검은색 칸이 연속되는 경우
                rowHintsCount++;
                rowHintsSumCount++;
            } else {
                // 흰색 칸이 연속되는 경우
                if (rowHintsCount > 0) {
                    // 검은색 조각이 끝나고 흰색 조각이 시작되는 경우
                    if (rowHints[rowHintsIndex] !== rowHintsCount) {
                        return false;
                    }
                    // 다음 힌트로 넘어간다.
                    rowHintsIndex++;
                    rowHintsCount = 0;
                }
                if (rowHintsSumCount > 0) {
                    // 검은색칸이 끝나고 흰색칸이 시작되는 경우마다
                    // 검은색칸의 수를 더해준다.
                    rowHintsSum += rowHintsSumCount;
                    rowHintsSumCount = 0;
                }
            }
        }
        // 마지막 힌트가 검은색 조각으로 끝나는 경우
        if (rowHintsCount > 0) {
            if (rowHints[rowHintsIndex] !== rowHintsCount) {
                return false;
            }
        }
        if (rowHintsSumCount > 0) {
            rowHintsSum += rowHintsSumCount;
        }
        // 검은색 조각의 수와 힌트의 합이 다른 경우
        if (rowHintsSum !== rowLength) {
            return false;
        }
        return true;
    }
}

const nonoFinder = {
    /*
     * @function find
     * @param {number} rowNum
     * @param {number} colNum
     * @param {number[][]} rowHints
     * @param {number[][]} columnHints
     * @return {number[][]}
     */
    solve: async (rowNum, colNum, rowHints, columnHints) => {

        const result = {
            valid: true,
            notValidReason: '',
            solved: false,
            answer: [],
        };

        if(!rowNum || !colNum || !rowHints || !columnHints) {
            result.valid = false;
            result.notValidReason = 'Required parameters are missing';
            return result;
        }

        rowNum = Number(rowNum);
        colNum = Number(colNum);

        // Create a new nonogram
        const nonogram = new Nonogram(rowNum, colNum, rowHints, columnHints);

        // Check if hints are valid
        const validHintsResponse = await nonogram.isValidHints();

        // If hints are valid, solve the nonogram
        if (!validHintsResponse.isValid) {
            result.valid = false;
            if (validHintsResponse.notValidReason) {
                result.notValidReason = validHintsResponse.notValidReason;
            } else {
                result.notValidReason = 'Invalid hints';
            }
            return result;
        } 

        // Solve the nonogram
        const solveResponse = await nonogram.solve();

        // If solved, return the answer
        if (solveResponse.solved) {
            result.solved = true;
            result.answer = solveResponse.answer;
        } else {
            result.solved = false;
        }
        return result;
    }
}
