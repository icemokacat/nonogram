'use strict';
class Changer {
    constructor(start, end, mark, fixed) {
        this.start = start;
        this.end = end;
        this.mark = mark;
        this.fixed = fixed;

        // start 한번 선언된 후에는 변경되지 않도록 한다.
        Object.defineProperty(this, 'start', {
            writable: false
        });
        // end 한번 선언된 후에는 변경되지 않도록 한다.
        Object.defineProperty(this, 'end', {
            writable: false
        });
        // mark 한번 선언된 후에는 변경되지 않도록 한다.
        Object.defineProperty(this, 'mark', {
            writable: false
        });
        // fixed 한번 선언된 후에는 변경되지 않도록 한다.
        Object.defineProperty(this, 'fixed', {
            writable: false
        });
    }

    getStart() {
        return this.start;
    }

    getEnd() {
        return this.end;
    }

    getMark() {
        return this.mark;
    }

    getFixed() {
        return this.fixed;
    }
}
function blockMark (changer, row) {
    // 특정 부분을 표시한다.

    if(!(changer instanceof Changer)) {
        throw new Error('Changer must be a Changer');
    }

    const start = changer.getStart();
    const end = changer.getEnd();
    const mark = changer.getMark();
    const fixed = changer.getFixed();
    
    if (start > end) {
        throw new Error('Start index must be less than or equal to end index');
    }

    if (start === end) {
        if(mark == true) {
            row[start].mark();
        }else{
            row[start].unmark();
        }
        if(fixed == true) {
            row[start].setFixed();
        }
        row[start].setStart(true);
        row[start].setEnd(true);
    }else{
        for(let i = start; i <= end; i++) {
            if(mark == true) {
                row[i].mark();
            }else{
                row[i].unmark();
            }
            if(i == start) {
                row[i].setStart(true);
            }
            if(i == end) {
                row[i].setEnd(true);
            }
            if(fixed == true) {
                row[i].setFixed();
            }
        }
    }
}
class Cell {
    constructor() {
        this.value = 0;
        this.isFixed = false;
        this.isMarked = false;
        this.start = false;
        this.end = false;
    }

    setStart(flag) {
        this.start = flag;
    }

    isStart() {
        return this.start;
    }

    setEnd(flag) {
        this.end = flag;
    }

    isEnd() {
        return this.end;
    }

    getValue() {
        return this.value;
    }

    setFixed() {
        this.isFixed = true;
    }

    fixed() {
        return this.isFixed;
    }

    mark() {
        if( this.isFixed == true ) {
            return;
        }else{
            this.isMarked = true;
            this.value = 1;
        }
    }

    unmark() {
        if( this.isFixed == true ) {
            return;
        }else{
            this.isMarked = false;
            this.value = 0;
        }
    }

    getMarked() {
        return this.isMarked;
    }

    toggleMarked() {
        if(this.getMarked()) {
            this.unmark();
        }else{
            this.mark();
        }
    }
}
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
        for (let i = 0; i < this.rowNum; i++) {
            grid.push([]);
            for (let j = 0; j < this.colNum; j++) {
                grid[i].push(new Cell());
            }
        }
        return grid;
    }

    async cloneDeep(obj) {
        // obj is array<array<Cell>>
        const objCopy = [];
        for (let i = 0; i < obj.length; i++) {
            objCopy.push([]);
            for (let j = 0; j < obj[i].length; j++) {
                const isFixed = obj[i][j].fixed();
                const isMarked = obj[i][j].getMarked();
                const start = obj[i][j].isStart();
                const end = obj[i][j].isEnd();
                const cell = new Cell();
                if(isMarked){
                    cell.mark();
                }else{
                    cell.unmark();
                }
                if(isFixed){
                    cell.setFixed();
                }
                if(start){
                    cell.setStart(true);
                }
                if(end){
                    cell.setEnd(true);
                }
                objCopy[i].push(cell);
            }
        }
        return objCopy;
    }

    getGrid() {
        return this.grid;
    }

    /*
        * @function toArraysFromGrid
        * @description Converts grid to array
        * @param {Array<Array<Cell>>} grid
        * @returns {Array<Array<number>>}
     */
    async toArraysFromGrid(gridArrays) {
        const gridObjArraysCopy = await this.cloneDeep(gridArrays);
        const grid = [];
        for (let i = 0; i < this.rowNum; i++) {
            grid.push([]);
            for (let j = 0; j < this.colNum; j++) {
                grid[i].push(gridObjArraysCopy[i][j].getValue());
            }
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

    async setFixSolve() {
        // 고정 가능한 cell 을 찾아서 고정시킨다.
        // 1. row hints 의 합이 colNum 과 같은 경우
        let rowHintCnt = this.rowHints.length;
        for(let i = 0; i < rowHintCnt; i++) {
            let rowHintSum = 0;
            let rowHintLength = this.rowHints[i].length;
            for(let j = 0; j < rowHintLength; j++) {
                rowHintSum += this.rowHints[i][j];
            }
            // 힌트합과 + (힌트갯수 - 1) 이 colNum 과 같은 경우
            let minBlankCnt = rowHintLength == 1 ? 1 : rowHintLength - 1;
            if(rowHintSum + minBlankCnt == this.colNum) {
                // ex) col 수가 10 이고 힌트가 [4,3,1] 인 경우
                // 모든 칸을 확정적으로 채울 수 있으므로 고정시킨다.
                let row = this.grid[i];
                let completeHints = this.rowHints[i];
                let completeHintsLength = completeHints.length;

                let rowLength = row.length;
                let startIdx = 0;
                let endIdx = 0;
                // 먼저 힌트의 수만큼 block 을 칠하고, 마지막 힌트가 아닌 경우 칠한 block 사이에 공백을 둔다.
                for(let j = 0; j < completeHintsLength; j++) {
                    // 변수 hoisting 발생하지 않도록 작성
                    // ex) 4일때 endIdx 는 3
                    endIdx = startIdx + completeHints[j] - 1;
                    // block 을 칠하고 (0~3)
                    const changer = new Changer(startIdx, endIdx, true, true);
                    blockMark(changer, row); 
                    
                    // ex) 4일때 startIdx 는 4
                    startIdx = endIdx + 1;

                    // 마지막 힌트가 아닌 경우 공백을 fix
                    if(j != completeHintsLength - 1 || rowHintLength == 1) {
                        row[startIdx].unmark();
                        row[startIdx].setFixed();
                        startIdx = endIdx + 2;
                    }
                }

            }
            // 힌트가 1개인 경우면서 해당 값이 colNum / 2 보다 큰 경우
            // ex) colNum 이 10 이고 힌트가 [7] 인 경우
            // 좌우로 10 - 힌트값 만큼 공백을 둔다.
            // 나머지는 채운다.
            else if(rowHintLength == 1 && rowHintSum > (this.colNum / 2)) {
                let row = this.grid[i];
                let hintValue = this.rowHints[i][0];
                let blackCnt = this.colNum - hintValue;
                
                // 좌측 공백
                let startIdx = 0;
                let endIdx = blackCnt - 1;
                const sidx = startIdx;
                const eidx = endIdx;
                const changer = new Changer(sidx, eidx, false, true);
                blockMark(changer, row);

                // 우측 공백
                startIdx = this.colNum - blackCnt;
                endIdx = this.colNum - 1;
                const sidx2 = startIdx;
                const eidx2 = endIdx;
                const changer2 = new Changer(sidx2, eidx2, false, true);
                blockMark(changer2, row);

                // 나머지는 채운다.
                startIdx = blackCnt;
                endIdx = this.colNum - blackCnt - 1;
                const sidx3 = startIdx;
                const eidx3 = endIdx;
                const changer3 = new Changer(sidx3, eidx3, true, true);
                blockMark(changer3, row);
            }
            // this.rowHints[i] 의 length 가 0 인 경우 모두 흰색으로 채운다. (fix)
            else if(rowHintLength == 0) {
                let row = this.grid[i];
                const sidx = 0;
                const eidx = row.length - 1;
                const changer = new Changer(sidx, eidx, false, true);
                blockMark(changer, row);
            }
        }

        // 2. column hints 의 합이 rowNum 과 같은 경우
        let columnHintCnt = this.columnHints.length;
        for(let i = 0; i < columnHintCnt; i++) {
            let columnHintSum = 0;
            let columnHintLength = this.columnHints[i].length;
            for(let j = 0; j < columnHintLength; j++) {
                columnHintSum += this.columnHints[i][j];
            }
            // 힌트합과 + (힌트갯수 - 1) 이 rowNum 과 같은 경우
            let minBlankCnt = columnHintLength == 1 ? 1 : columnHintLength - 1;
            if(columnHintSum + minBlankCnt == this.rowNum) {
                // ex) row 수가 10 이고 힌트가 [4,3,1] 인 경우
                // 모든 칸을 확정적으로 채울 수 있으므로 고정시킨다.
                let column = [];
                for(let j = 0; j < this.rowNum; j++) {
                    column.push(this.grid[j][i]);
                }
                let completeHints = this.columnHints[i];
                let completeHintsLength = completeHints.length;

                let startIdx = 0;
                let endIdx = 0;
                let columnLength = column.length;
                for(let j = 0; j < completeHintsLength; j++) {
                    // ex) 4일때 endIdx 는 3
                    endIdx = startIdx + completeHints[j] - 1;
                    // block 을 칠하고 (0~3)
                    const changer = new Changer(startIdx, endIdx, true, true);
                    blockMark(changer, column);

                    // ex) 4일때 startIdx 는 4
                    startIdx = endIdx + 1;

                    // 마지막 힌트가 아닌 경우 공백을 fix
                    if(j != completeHintsLength - 1 || columnHintLength == 1) {
                        column[startIdx].unmark();
                        column[startIdx].setFixed();
                        startIdx = endIdx + 2;
                    }
                }

                // 마지막 힌트가 rowNum 과 같은 경우
                if(endIdx == columnLength - 1) {
                    // 모든 칸을 확정적으로 채울 수 있으므로 고정시킨다.
                    const changer = new Changer(startIdx, endIdx, true, true);
                    blockMark(changer, column);
                }
            }
            // 힌트가 1개인 경우면서 해당 값이 rowNum / 2 보다 큰 경우
            // ex) rowNum 이 10 이고 힌트가 [7] 인 경우
            // 상하로 10 - 힌트값 만큼 공백을 둔다.
            // 나머지는 채운다.
            else if(columnHintLength == 1 && columnHintSum > (this.rowNum / 2)) {
                let column = [];
                for(let j = 0; j < this.rowNum; j++) {
                    column.push(this.grid[j][i]);
                }
                let hintValue = this.columnHints[i][0];
                let blackCnt = this.rowNum - hintValue;
                
                // 상단 공백
                let startIdx = 0;
                let endIdx = blackCnt - 1;
                const sidx = startIdx;
                const eidx = endIdx;
                const changer = new Changer(sidx, eidx, false, true);
                blockMark(changer, column);

                // 하단 공백
                startIdx = this.rowNum - blackCnt;
                endIdx = this.rowNum - 1;
                const sidx2 = startIdx;
                const eidx2 = endIdx;
                const changer2 = new Changer(sidx2, eidx2, false, true);
                blockMark(changer2, column);

                // 나머지는 채운다.
                startIdx = blackCnt;
                endIdx = this.rowNum - blackCnt - 1;
                const sidx3 = startIdx;
                const eidx3 = endIdx;
                const changer3 = new Changer(sidx3, eidx3, true, true);
                blockMark(changer3, column);
            }
            // this.columnHints[i] 의 length 가 0 인 경우 모두 흰색으로 채운다. (fix)
            else if(columnHintLength == 0) {
                let column = [];
                for(let j = 0; j < this.rowNum; j++) {
                    column.push(this.grid[j][i]);
                }
                const sidx = 0;
                const eidx = column.length - 1;
                const changer = new Changer(sidx, eidx, false, true);
                blockMark(changer, column);
            }

        }
        this.setCustomFix();
    }

    async setCustomFix(){
        // 추가 적으로 고정시킬 수 있는 cell 을 찾아서 고정시킨다.
    }

    getBlockTrainCnt(row) {
        // block 이 연속되게 칠해진 갯수를 구한다.
        // row 는 그냥 한줄이다.
        let rowLength = row.length;
        let blockCount = 0;
        let blockTrainCnt = 0;

        for(let i = 0; i < rowLength; i++) {
            if(row[i].getMarked() == true) {
                blockCount++;
            }else{
                if(blockCount > 0) {
                    blockTrainCnt++;
                    blockCount = 0;
                }
            }
        }

        if(blockCount > 0) {
            blockTrainCnt++;
        }

        return blockTrainCnt;
    }

    async predictMark(startIdx, endIdx, row) {
        // 특정 부분을 표시한다.
        for(let i = startIdx; i <= endIdx; i++) {
            const changer = new Changer(i, i, true, false);
            blockMark(changer, row);
        }
    }

    async predictUnMark(startIdx, endIdx, row) {
        // 특정 부분을 표시한다.
        for(let i = startIdx; i <= endIdx; i++) {
            const changer = new Changer(i, i, false, false);
            blockMark(changer, row);
        }
    }

    resetUnfixedMark() {
        // 고정되지 않은 cell 을 모두 unmark 한다.
        for(let i = 0; i < this.rowNum; i++) {
            let row = this.grid[i];
            this.resetUnfixedMarkRow(row);
        }
    }

    resetUnfixedMarkRow(row) {
        // 고정되지 않은 cell 을 모두 unmark 한다.
        let unmarkCnt = 0;
        for(let i = 0; i < row.length; i++) {            
            if(row[i].fixed() == false) {
                const start = i;
                const end = i;
                const mark = false;
                const fixed = false;
                const changer = new Changer(start, end, mark, fixed);
                blockMark(changer, row);
                unmarkCnt++;
            }
        }
        return unmarkCnt;
    }

    isAllFixed(row) {
        // 모든 cell 이 고정되었는지 확인한다.
        let rowLength = row.length;
        for(let i = 0; i < rowLength; i++) {
            if(row[i].fixed() == false) {
                return false;
            }
        }
        return true;
    }

    setHintRandomeMark(row, rowHints) {
        // [2,4,5] 특정 힌트 배열이 있을때
        // grid 의 row를 랜덤하게 채운다.

        // 힌트의 수만큼 랜덤하게 block 을 채운다.
        
        let rowLength = row.length;
        let rowHintsLength = rowHints.length;
        let startIdx = 0;

        for(let i = 0; i < rowHintsLength; i++) {
            let hintValue = rowHints[i];
            // 범위를 넘지 않도록 한다
            if(startIdx + hintValue - 1 > rowLength - 1) {
                break;
            }
            let randomStartIdx = Math.floor(Math.random() * rowLength);
            let randomEndIdx = randomStartIdx + hintValue - 1;
            this.predictMark(randomStartIdx, randomEndIdx, row);
        }

    }

    async solveBlock(){
        const limitRandom = 1000000;
        
        // 행 힌트를 기준으로 행을 채운다.
        let gridRowCnt = this.grid.length;
        for (let i = 0; i < gridRowCnt; i++) {
            let allFixRow = this.isAllFixed(this.grid[i]);
            if(allFixRow == true) {
                // 해당 행이 모두 확정된 경우 pass
                continue;
            }
            const hintCnt = this.rowHints[i].length;
            let trainCnt = this.getBlockTrainCnt(this.grid[i]);

            // block 의 갯수가 다른 경우 같아 질때 까지 랜덤하게 채운다. (힌트의 갯수 와 연속되게 칠해진 block 의 갯수)
            if(hintCnt != trainCnt) {
                this.setHintRandomeMark(this.grid[i], this.rowHints[i]);
            }

            let ran = 0;
            while(hintCnt != trainCnt) {
                trainCnt = this.getBlockTrainCnt(this.grid[i]);
                if(hintCnt == trainCnt ) {
                    break;
                }
                ran++;
                if(ran > limitRandom) {
                    console.warn('too many random loop in row');
                    break;
                }
                this.resetUnfixedMarkRow(this.grid[i]);
                this.setHintRandomeMark(this.grid[i], this.rowHints[i]);
            }
        }

        // 열 힌트를 기준으로 열을 채운다.
        let gridColCnt = this.grid[0].length;
        for (let i = 0; i < gridColCnt; i++) {
            let column = [];
            for(let j = 0; j < this.rowNum; j++) {
                column.push(this.grid[j][i]);
            }
            let allFixRow = this.isAllFixed(column);
            if(allFixRow == true) {
                // 해당 행이 모두 확정된 경우 pass
                continue;
            }
            const hintCnt = this.columnHints[i].length;
            let trainCnt = this.getBlockTrainCnt(column);

            // block 의 갯수가 다른 경우 같아 질때 까지 랜덤하게 채운다. (힌트의 갯수 와 연속되게 칠해진 block 의 갯수)
            if(hintCnt != trainCnt) {
                this.setHintRandomeMark(column, this.columnHints[i]);
            }

            let ran = 0;
            while(hintCnt != trainCnt) {
                trainCnt = this.getBlockTrainCnt(column);
                if(hintCnt == trainCnt) {
                    break;
                }
                ran++;
                if(ran > limitRandom) {
                    console.warn('too many random loop in column');
                    break;
                }
                this.resetUnfixedMarkRow(column);
                this.setHintRandomeMark(column, this.columnHints[i]);
            }
        }

    }

    async solve () {
        // Your nonogram solving logic goes here
        const result = {
            solved: false,
            answer: [],
        };

        await this.setFixSolve();

        let initSolveArray = await this.toArraysFromGrid(this.grid);
        let initSolve = await this.isValidAnswer(initSolveArray);

        if(initSolve == true) {
            result.solved = true;
            result.answer = clone(initSolveArray);
            return result;
        }else{
            console.log('initSolve fail...')
        }

        let limit = 1000000;
        let limit10per = limit / 10;
        let tryCnt = 0;

        while(result.solved != true && limit >= 0 ) {                
            tryCnt++;
            if(limit < 0) {
                console.info('too many loop solve');
                result.solved = false;
                result.answer = await this.toArraysFromGrid(this.grid);
                break;
            }else{
                this.resetUnfixedMark();
                await this.solveBlock();
                result.answer = await this.toArraysFromGrid(this.grid);
                result.solved = await this.isValidAnswer(result.answer);
                
                if(result.solved == true) {
                    console.info(' solved in ['+(1000000 - limit)+']');                    
                    break;
                }else{
                    limit--;
                    // if (limit % limit10per == 0){
                    //     console.info(' try again [ '+(limit)+']');
                    // }
                }
            }
        }

        // ? 10000 번 이상 반복하지 않았는데도 while 문을 빠져나온 경우
        if (limit >= 0 && result.solved != true) {
            console.info(`is invalid this while loop [${limit}]`)
        }

        return result;
    }

    async isValidAnswer(answer) {

        let chk1 = 0;

        // row check
        for (let i = 0; i < this.rowNum; i++) {
            const row = answer[i];
            const rowHints = this.rowHints[i];
            const rowCheck = this.check(row, rowHints);
            chk1++;
            if (!rowCheck) {
                return false;
            }
        }

        let chk2 = 0;

        // column check
        for (let i = 0; i < this.colNum; i++) {
            const column = [];
            for (let j = 0; j < this.rowNum; j++) {
                column.push(answer[j][i]);
            }
            const columnHints = this.columnHints[i];
            const columnCheck = this.check(column, columnHints);
            chk2++;
            if (!columnCheck) {
                return false;
            }
        }

        if(chk1 != this.rowNum || chk2 != this.colNum) {
            return false;
        }

        return true;
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

        let chk = 0;
        for (let i = 0; i < rowLength; i++) {
            chk++;
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

        if (chk < rowLength) {
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
            result.answer = solveResponse.answer;
        }
        return result;
    }
}
