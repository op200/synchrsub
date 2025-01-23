class Sub {
    Layer: number = 0; // 0..int
    Start: number = 0; // ms
    End: number = 0; // ms
    Style: string = '';
    Actor: string = '';
    Effect: string = '';
    Text: string = '';

    MarginL: number = 0; // int
    MarginR: number = 0; // int
    MarginV: number = 0; // int

    Comment: boolean = false;

    setLayer(Layer: number) {
        if (!Number.isInteger(Layer)) {
            console.warn("Layer is not int: ", Layer);
            Layer = Math.round(Layer);
        }
        if (Layer < 0) {
            console.warn("Layer < 0: ", Layer);
            Layer = 0;
        }
        this.Layer = Layer;
    }

    setStart(Start: number) {
        if (Start < 0) {
            console.warn("Start < 0: ", Start);
            Start = 0;
        }
        this.Start = Start;
    }

    getStartStr() {
        return Sub.ms2str(this.Start);
    }

    setEnd(End: number) {
        if (End < 0) {
            console.warn("End < 0: ", End);
            End = 0;
        }
        this.End = End;
    }

    getEndStr() {
        return Sub.ms2str(this.End);
    }

    setStyle(Style: string) {
        if (Style.includes(',')) {
            console.warn("Style has ',': ", Style);
            Style = Style.replace(/,/g, '');
        }
        this.Style = Style;
    }

    setActor(Actor: string) {
        if (Actor.includes(',')) {
            console.warn("Actor has ',': ", Actor);
            Actor = Actor.replace(/,/g, '');
        }
        this.Actor = Actor;
    }

    setEffect(Effect: string) {
        if (Effect.includes(',')) {
            console.warn("Effect has ',': ", Effect);
            Effect = Effect.replace(/,/g, '');
        }
        this.Effect = Effect;
    }

    setText(Text: string) {
        Text = Text.replace(/\n/g, '\\N');
        this.Text = Text;
    }

    setMarginL(MarginL: number) {
        if (!Number.isInteger(MarginL)) {
            console.warn("MarginL is not int: ", MarginL);
            MarginL = Math.round(MarginL);
        }
        if (MarginL < 0) {
            console.warn("MarginL < 0: ", MarginL);
            MarginL = 0;
        }
        this.MarginL = MarginL;
    }

    setMarginR(MarginR: number) {
        if (!Number.isInteger(MarginR)) {
            console.warn("MarginR is not int: ", MarginR);
            MarginR = Math.round(MarginR);
        }
        if (MarginR < 0) {
            console.warn("MarginR < 0: ", MarginR);
            MarginR = 0;
        }
        this.MarginR = MarginR;
    }

    setMarginV(MarginV: number) {
        if (!Number.isInteger(MarginV)) {
            console.warn("MarginV is not int: ", MarginV);
            MarginV = Math.round(MarginV);
        }
        if (MarginV < 0) {
            console.warn("MarginV < 0: ", MarginV);
            MarginV = 0;
        }
        this.MarginV = MarginV;
    }

    setComment(Comment: boolean) {
        this.Comment = Comment;
    }

    constructor(
        Comment: boolean = false,
        Layer: number = 0,
        Start: number = 0,
        End: number = 0,
        Style: string = '',
        Actor: string = '',
        MarginL: number = 0,
        MarginR: number = 0,
        MarginV: number = 0,
        Effect: string = '',
        Text: string = ''
    ) {
        this.setComment(Comment);
        this.setLayer(Layer);
        this.setStart(Start);
        this.setEnd(End);
        this.setStyle(Style);
        this.setActor(Actor);
        this.setMarginL(MarginL);
        this.setMarginR(MarginR);
        this.setMarginV(MarginV);
        this.setEffect(Effect);
        this.setText(Text);
    }

    static ms2str(ms: number) {
        const formattedHours = Math.floor(ms / 3600000)
            .toString();
        ms %= 3600000;

        const formattedMinutes = Math.floor(ms / 60000)
            .toString().padStart(2, '0');
        ms %= 60000;

        const formattedSeconds = Math.floor(ms / 1000)
            .toString().padStart(2, '0');

        const formattedMilliseconds = Math.round(ms % 1000 / 10)
            .toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
    }

    static str2ms(str: string) {
        let arr1 = str.split(':');
        const arr2 = arr1[2].split('.');

        const h = Number(arr1[0]);
        const m = Number(arr1[1]);
        const s = Number(arr2[0]);
        const ms = Number(arr2[1]);

        return h * 3600000 + m * 60000 + s * 1000 + ms;
    }

    toString() {
        return (this.Comment ? 'Comment' : 'Dialogue') + ': ' +
            [
                this.Layer,
                Sub.ms2str(this.Start),
                Sub.ms2str(this.End),
                this.Style,
                this.Actor,
                this.MarginL,
                this.MarginR,
                this.MarginV,
                this.Effect,
                this.Text
            ].join(',');
    }
}

type SubRow = {
    sub: Sub;
    selected: boolean;
}

class SubRowList {
    constructor(
        public val: SubRow[],
        public currentRowIndex: number = 0
    ) {

    }

    toString() {
        return this.val.map(subRow => subRow.sub.toString()).join('\n') + '\n';
    }

    clearSelected() {
        this.val.forEach(item => {
            item.selected = false;
        });
    }

    insertEmpty(offset: number) {
        this.clearSelected();

        const newSub = new Sub();
        newSub.Style = this.val[this.currentRowIndex].sub.Style;
        if (offset == 0) {
            const preStart = this.val[this.currentRowIndex - 1 < 0 ? 0 : this.currentRowIndex - 1].sub.Start;
            if (preStart >= this.val[this.currentRowIndex].sub.Start - 3000 && preStart < this.val[this.currentRowIndex].sub.Start)
                newSub.Start = preStart;
            else
                newSub.Start = this.val[this.currentRowIndex].sub.Start;

            newSub.End = this.val[this.currentRowIndex].sub.Start;
        }
        else if (offset == 1) {
            newSub.Start = this.val[this.currentRowIndex].sub.End;

            const nextEnd = this.val[this.currentRowIndex + 1 >= this.val.length ? this.val.length - 1 : this.currentRowIndex + 1].sub.End;
            if (nextEnd <= this.val[this.currentRowIndex].sub.End + 3000 && nextEnd > this.val[this.currentRowIndex].sub.End)
                newSub.End = nextEnd;
            else
                newSub.End = this.val[this.currentRowIndex].sub.End;
        }

        this.val.splice(this.currentRowIndex += offset, 0, {
            sub: newSub,
            selected: false
        });

        this.val[this.currentRowIndex].selected = true;
    }
}

class SubColor {
    constructor(
        public r: number = 0,
        public g: number = 0,
        public b: number = 0,
        public a: number = 0
    ) {

    }

    set(input: string): SubColor {
        if (input.startsWith('&') || input.endsWith('&')) {
            for (; input.endsWith('&'); input = input.slice(0, -1));

            let a = input.slice(-8, -4);
            if (a && a.length === 2)
                this.a = parseInt(a, 16);
            this.b = parseInt(input.slice(-6, -4), 16);
            this.g = parseInt(input.slice(-4, -2), 16);
            this.r = parseInt(input.slice(-2), 16);
        }
        else if (input.startsWith('#')) {
            this.r = parseInt(input.slice(-6, -4), 16);
            this.g = parseInt(input.slice(-4, -2), 16);
            this.b = parseInt(input.slice(-2), 16);
        }

        return this;
    }

    /**
     * @returns #RRGGBB
     */
    getHTMLColor() {
        return `#${this.r.toString(16).toUpperCase().padStart(2, '0')}${this.g.toString(16).toUpperCase().padStart(2, '0')}${this.b.toString(16).toUpperCase().padStart(2, '0')}`;
    }

    /**
     * @returns &HAABBGGRR
     */
    getAssStyleColor() {
        return `&H${this.a.toString(16).toUpperCase().padStart(2, '0')}${this.b.toString(16).toUpperCase().padStart(2, '0')}${this.g.toString(16).toUpperCase().padStart(2, '0')}${this.r.toString(16).toUpperCase().padStart(2, '0')}`;
    }
}

class SubStyle {
    constructor(
        public Name: string = 'Default',
        public Fontname: string = '',
        public Fontsize: number = 64,
        public PrimaryColour: SubColor = new SubColor(255, 255, 255),
        public SecondaryColour: SubColor = new SubColor(255, 0, 0),
        public OutlineColour: SubColor = new SubColor(0, 0, 0),
        public BackColour: SubColor = new SubColor(0, 0, 0),
        public Bold: boolean = false,
        public Italic: boolean = false,
        public Underline: boolean = false,
        public StrikeOut: boolean = false,
        public ScaleX: number = 100,
        public ScaleY: number = 100,
        public Spacing: number = 0,
        public Angle: number = 0,
        public BorderStyle: 1 | 3 = 1,
        public Outline: number = 2,
        public Shadow: number = 0,
        public Alignment: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 = 2,
        public MarginL: number = 10,
        public MarginR: number = 10,
        public MarginV: number = 30,
        public Encoding: number = 1
    ) {

    }

    toString() {
        return 'Style: ' +
            [
                this.Name,
                this.Fontname,
                this.Fontsize,
                this.PrimaryColour.getAssStyleColor(),
                this.SecondaryColour.getAssStyleColor(),
                this.OutlineColour.getAssStyleColor(),
                this.BackColour.getAssStyleColor(),
                this.Bold ? '-1' : '0',
                this.Italic ? '-1' : '0',
                this.Underline ? '-1' : '0',
                this.StrikeOut ? '-1' : '0',
                this.ScaleX,
                this.ScaleY,
                this.Spacing,
                this.Angle,
                this.BorderStyle,
                this.Outline,
                this.Shadow,
                this.Alignment,
                this.MarginL,
                this.MarginR,
                this.MarginV,
                this.Encoding
            ].join(',');
    }
}

class SubStyleList {
    constructor(
        public val: SubStyle[],
        public currentRowIndex: number = 0
    ) {

    }

    toString() {
        return this.val.map(style => style.toString()).join('\n') + '\n';
    }

    /**
     * check if name exists or not
     * @param name
     * @returns res ? pass : exists same name
     */
    checkName(name: string, excludeIndex: number = -1) {
        if (name === '') return false;

        if (excludeIndex >= 0)
            for (const [index, item] of this.val.entries()) {
                if (index === excludeIndex)
                    continue;
                if (item.Name === name)
                    return false;
            }
        else
            for (const item of this.val)
                if (item.Name === name) {
                    return false;
                }

        return true;
    }

    insert(style: SubStyle, index: number = this.val.length) {
        if (!this.checkName(style.Name)) {
            console.warn(`Style with name ${style.Name} already exists.`);
            return;
        }

        this.val.splice(index, 0, style);
    }

    moveUp() {
        if (this.currentRowIndex === 0) return;

        [this.val[this.currentRowIndex - 1], this.val[this.currentRowIndex]] = [this.val[this.currentRowIndex], this.val[this.currentRowIndex - 1]];
        --this.currentRowIndex;
    }

    moveDown() {
        if (this.currentRowIndex === this.val.length - 1) return;

        [this.val[this.currentRowIndex + 1], this.val[this.currentRowIndex]] = [this.val[this.currentRowIndex], this.val[this.currentRowIndex + 1]];
        ++this.currentRowIndex;
    }

    delect() {
        if (this.val.length === 0) return;
        if (this.currentRowIndex >= this.val.length) {
            console.error("Current row index is out of bounds");
            return;
        }

        this.val.splice(this.currentRowIndex, 1);
        if (this.currentRowIndex === 0)
            return;
        else
            --this.currentRowIndex;
    }
}

class SubInfo {
    constructor(
        public commentsList: string[] = [],
        public Title: string = '',
        public Original_Script: string = '',
        public Original_Translation: string = '',
        public Original_Editing: string = '',
        public Original_Timing: string = '',
        public Synch_Point: string = '',
        public Script_Updated_By: string = '',
        public Update_Details: string = '',
        public ScriptType: string = 'v4.00+',
        // Collisions: , SSA 属性，渲染器不支持
        public PlayResX: number = 0,
        public PlayResY: number = 0,
        public PlayDepth: number = 0,
        // Timer: number, // .4f SSA 属性，无效
        public WrapStyle: '0' | '1' | '2' | '3' = '0',
        public ScaledBorderAndShadow: 'yes' | 'no' = 'yes',
        public YCbCr_Matrix: 'None' | 'TV.601' | 'PC.601' | 'TV.709' | 'PC.709' | 'TV.FCC' | 'PC.FCC' | 'TV.240M' | 'PC.240M' = 'None'
    ) {

    }

    toString() {
        let dict: { [key: string]: string } = {};
        if (this.Title != '')
            dict['Title'] = this.Title;

        if (this.Original_Script !== '')
            dict['Original Script'] = this.Original_Script;
        if (this.Original_Translation !== '')
            dict['Original Translation'] = this.Original_Translation;
        if (this.Original_Editing !== '')
            dict['Original Editing'] = this.Original_Editing;
        if (this.Original_Timing !== '')
            dict['Original Timing'] = this.Original_Timing;
        if (this.Synch_Point !== '')
            dict['Synch Point'] = this.Synch_Point;
        if (this.Script_Updated_By !== '')
            dict['Script Updated By'] = this.Script_Updated_By;
        if (this.Update_Details !== '')
            dict['Update Details'] = this.Update_Details;

        if (this.PlayResX !== 0)
            dict['PlayResX'] = this.PlayResX.toString();
        if (this.PlayResY !== 0)
            dict['PlayResY'] = this.PlayResY.toString();
        if (this.PlayDepth !== 0)
            dict['PlayDepth'] = this.PlayDepth.toString();

        dict['ScriptType'] = this.ScriptType;
        dict['WrapStyle'] = this.WrapStyle;
        dict['ScaledBorderAndShadow'] = this.ScaledBorderAndShadow;
        dict['YCbCr Matrix'] = this.YCbCr_Matrix;

        return this.commentsList.join('\n') + '\n' +
            Object.entries(dict)
                .map(([key, val]) => `${key}: ${val}`)
                .join('\n') + '\n';
    }
}

class SubFile {
    constructor(
        public info: SubInfo,
        public styleList: SubStyleList,
        public rowList: SubRowList
    ) {

    }

    static decode(rawString: string): SubFile {
        const lines = rawString.split('\n').map(str => str.replace(/\r$/, ''));
        let info = new SubInfo();
        let rawStyleList: SubStyle[] = [];
        let rawSubRowList: SubRow[] = [];
        let index = 0;
        for (; index < lines.length; ++index)
            if (lines[index] == '[Script Info]')
                break;

        for (; index < lines.length; ++index) {
            const line = lines[index];
            if (line == '[V4+ Styles]')
                break;

            if (line[0] == ';')
                info.commentsList.push(line);
            else {
                const arr = line.split(':').map(str => str.trim());
                const key = arr[0] as 'Title'; // 下文有if判断，所以直接断言，不然会报弱智错误
                if (key in info)
                    info[key] = arr.slice(1).join(':').trim();
            }
        }

        for (; index < lines.length; ++index) {
            const line = lines[index];
            if (line == '[Events]')
                break;

            const headIndex = line.indexOf(':');
            if (line.slice(0, headIndex) === 'Style') {
                const arr = line
                    .slice(headIndex + 1)
                    .split(',')
                    .map(str => str.trim());
                rawStyleList.push(new SubStyle(
                    arr[0], // Name
                    arr[1], // Fontname
                    Number(arr[2]), // Fontsize
                    new SubColor().set(arr[3]), // PrimaryColour
                    new SubColor().set(arr[4]), // SecondaryColour
                    new SubColor().set(arr[5]), // OutlineColour
                    new SubColor().set(arr[6]), // BackColour
                    arr[7] === '0' ? false : true, // Bold
                    arr[8] === '0' ? false : true, // Italic
                    arr[9] === '0' ? false : true, // Underline
                    arr[10] === '0' ? false : true, // StrikeOut
                    Number(arr[11]), // ScaleX
                    Number(arr[12]), // ScaleY
                    Number(arr[13]), // Spacing
                    Number(arr[14]), // Angle
                    Number(arr[15]) as 1 | 3, // BorderStyle
                    Number(arr[16]), // Outline
                    Number(arr[17]), // Shadow
                    Number(arr[18]) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, // Alignment
                    Number(arr[19]), // MarginL
                    Number(arr[20]), // MarginR
                    Number(arr[21]), // MarginV
                    Number(arr[22]) // Encoding
                ));
            }
        }

        index += 2;
        for (; index < lines.length; ++index) {
            const line = lines[index];

            const headIndex = line.indexOf(':');

            if (headIndex === -1)
                break;

            const arr = line.slice(headIndex + 1).split(',').map(str => str.trim());
            rawSubRowList.push({
                sub: new Sub(
                    line.slice(0, headIndex) == 'Comment', // Comment
                    Number(arr[0]), // Layer
                    Sub.str2ms(arr[1]), // Start
                    Sub.str2ms(arr[2]), // End
                    arr[3], // Style
                    arr[4], // Actor
                    Number(arr[5]), // MarginL
                    Number(arr[6]), // MarginR
                    Number(arr[7]), // MarginV
                    arr[8], // Effect
                    arr.slice(9).join(',') // Text
                ),
                selected: false
            });
        }

        return new SubFile(
            info,
            new SubStyleList(rawStyleList),
            new SubRowList(rawSubRowList)
        )
    }

    encode(): string {
        return [
            '[Script Info]',
            this.info.toString(),
            '[V4+ Styles]',
            'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
            this.styleList.toString(),
            '[Events]',
            'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
            this.rowList.toString()
        ].join('\n');
    }
}

export { Sub, SubStyle, SubFile };