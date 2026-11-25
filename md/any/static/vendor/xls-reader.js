//#region src/types.ts
var CellError = class {
	constructor(code) {
		this.code = code;
	}
	toString() {
		return this.code;
	}
};

//#endregion
//#region src/errors.ts
var XlsError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "XlsError";
	}
};

//#endregion
//#region src/biff/record-stream.ts
function readRecords(stream) {
	const view = new DataView(stream.buffer, stream.byteOffset, stream.byteLength);
	const records = [];
	let pos = 0;
	while (pos + 4 <= stream.length) {
		const type = view.getUint16(pos, true);
		const length = view.getUint16(pos + 2, true);
		if (pos + 4 + length > stream.length) break;
		records.push({
			type,
			data: stream.subarray(pos + 4, pos + 4 + length),
			offset: pos
		});
		pos += 4 + length;
	}
	return records;
}

//#endregion
//#region src/byte-reader.ts
var ByteReader = class {
	constructor(bytes, start = 0) {
		this.bytes = bytes;
		this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
		this.cursor = start;
	}
	get position() {
		return this.cursor;
	}
	set position(value) {
		this.cursor = value;
	}
	get remaining() {
		return this.bytes.length - this.cursor;
	}
	u8() {
		this.require(1);
		const value = this.view.getUint8(this.cursor);
		this.cursor += 1;
		return value;
	}
	u16() {
		this.require(2);
		const value = this.view.getUint16(this.cursor, true);
		this.cursor += 2;
		return value;
	}
	u32() {
		this.require(4);
		const value = this.view.getUint32(this.cursor, true);
		this.cursor += 4;
		return value;
	}
	f64() {
		this.require(8);
		const value = this.view.getFloat64(this.cursor, true);
		this.cursor += 8;
		return value;
	}
	slice(length) {
		this.require(length);
		const view = this.bytes.subarray(this.cursor, this.cursor + length);
		this.cursor += length;
		return view;
	}
	skip(length) {
		this.cursor += length;
	}
	require(length) {
		if (!Number.isInteger(this.cursor) || this.cursor < 0) throw new XlsError(`Invalid read offset ${this.cursor}: corrupt structure`);
		if (this.cursor + length > this.bytes.length) throw new XlsError(`Unexpected end of data: needed ${length} byte(s) at offset ${this.cursor}, but only ${this.remaining} remain`);
	}
};

//#endregion
//#region src/biff/error-code.ts
const CODE_BY_BYTE = /* @__PURE__ */ new Map([
	[0, "#NULL!"],
	[7, "#DIV/0!"],
	[15, "#VALUE!"],
	[23, "#REF!"],
	[29, "#NAME?"],
	[36, "#NUM!"],
	[42, "#N/A"]
]);
function errorFromByte(byte) {
	const code = CODE_BY_BYTE.get(byte);
	return code === void 0 ? null : new CellError(code);
}

//#endregion
//#region src/biff/rk-number.ts
function decodeRk(rk) {
	const dividedBy100 = (rk & 1) !== 0;
	const value = (rk & 2) !== 0 ? rk >> 2 : rkAsDouble(rk);
	return dividedBy100 ? value / 100 : value;
}
function rkAsDouble(rk) {
	const view = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
	view.setUint32(4, rk & 4294967292, true);
	return view.getFloat64(0, true);
}

//#endregion
//#region src/biff/unicode-string.ts
const F_WIDE$1 = 1;
const F_EXT$1 = 4;
const F_RICH$1 = 8;
const BYTES_PER_RUN$1 = 4;
function readUnicodeString(reader, shortLength) {
	const charCount = shortLength ? reader.u8() : reader.u16();
	const flags = reader.u8();
	const wide = (flags & F_WIDE$1) !== 0;
	const runCount = (flags & F_RICH$1) !== 0 ? reader.u16() : 0;
	const extSize = (flags & F_EXT$1) !== 0 ? reader.u32() : 0;
	let text = "";
	for (let i = 0; i < charCount; i++) text += String.fromCharCode(wide ? reader.u16() : reader.u8());
	reader.skip(runCount * BYTES_PER_RUN$1 + extSize);
	return text;
}

//#endregion
//#region src/biff/cell-records.ts
function decodeLabelSst(data, ctx) {
	const reader = new ByteReader(data);
	const { row, col } = readHead(reader);
	const index = reader.u32();
	return {
		row,
		col,
		value: ctx.sharedStrings[index] ?? ""
	};
}
function decodeLabel(data) {
	const reader = new ByteReader(data);
	const { row, col } = readHead(reader);
	return {
		row,
		col,
		value: readUnicodeString(reader, false)
	};
}
function decodeNumber(data, ctx) {
	const reader = new ByteReader(data);
	const { row, col, xf } = readHead(reader);
	return {
		row,
		col,
		value: ctx.numeric(xf, reader.f64())
	};
}
function decodeRkCell(data, ctx) {
	const reader = new ByteReader(data);
	const { row, col, xf } = readHead(reader);
	return {
		row,
		col,
		value: ctx.numeric(xf, decodeRk(reader.u32()))
	};
}
function decodeBlank(data) {
	const { row, col } = readHead(new ByteReader(data));
	return {
		row,
		col,
		value: null
	};
}
function decodeBoolErr(data) {
	const reader = new ByteReader(data);
	const { row, col } = readHead(reader);
	const raw = reader.u8();
	return {
		row,
		col,
		value: reader.u8() !== 0 ? errorFromByte(raw) : raw !== 0
	};
}
function decodeMulRk(data, ctx) {
	const reader = new ByteReader(data);
	const row = reader.u16();
	const colFirst = reader.u16();
	const count = (data.length - 6) / 6;
	const cells = [];
	for (let i = 0; i < count; i++) {
		const xf = reader.u16();
		cells.push({
			row,
			col: colFirst + i,
			value: ctx.numeric(xf, decodeRk(reader.u32()))
		});
	}
	return cells;
}
function decodeMulBlank(data) {
	const row = new ByteReader(data).u16();
	const colFirst = new ByteReader(data, 2).u16();
	const count = (data.length - 6) / 2;
	const cells = [];
	for (let i = 0; i < count; i++) cells.push({
		row,
		col: colFirst + i,
		value: null
	});
	return cells;
}
function decodeFormula(data, ctx) {
	const reader = new ByteReader(data);
	const { row, col, xf } = readHead(reader);
	const result = data.subarray(reader.position, reader.position + 8);
	if (isNonNumericResult(result)) return nonNumericResult(row, col, result);
	return {
		kind: "value",
		cell: {
			row,
			col,
			value: ctx.numeric(xf, reader.f64())
		}
	};
}
function isNonNumericResult(result) {
	return result[6] === 255 && result[7] === 255;
}
function nonNumericResult(row, col, result) {
	const kind = result[0];
	if (kind === 0) return {
		kind: "pending-string",
		row,
		col
	};
	if (kind === 1) return {
		kind: "value",
		cell: {
			row,
			col,
			value: result[2] !== 0
		}
	};
	return {
		kind: "value",
		cell: {
			row,
			col,
			value: kind === 2 ? errorFromByte(result[2] ?? 255) : null
		}
	};
}
function readHead(reader) {
	return {
		row: reader.u16(),
		col: reader.u16(),
		xf: reader.u16()
	};
}

//#endregion
//#region src/biff/record-types.ts
const RecordType = {
	BOF: 2057,
	EOF: 10,
	BOUNDSHEET8: 133,
	DATEMODE: 34,
	FORMAT: 1054,
	XF: 224,
	SST: 252,
	CONTINUE: 60,
	LABELSST: 253,
	LABEL: 516,
	RSTRING: 214,
	NUMBER: 515,
	RK: 638,
	MULRK: 189,
	BLANK: 513,
	MULBLANK: 190,
	BOOLERR: 517,
	FORMULA: 6,
	STRING: 519
};

//#endregion
//#region src/biff/sheet-decoder.ts
const DECODERS = /* @__PURE__ */ new Map([
	[RecordType.LABELSST, (d, c) => [decodeLabelSst(d, c)]],
	[RecordType.LABEL, (d) => [decodeLabel(d)]],
	[RecordType.RSTRING, (d) => [decodeLabel(d)]],
	[RecordType.NUMBER, (d, c) => [decodeNumber(d, c)]],
	[RecordType.RK, (d, c) => [decodeRkCell(d, c)]],
	[RecordType.MULRK, (d, c) => decodeMulRk(d, c)],
	[RecordType.BLANK, (d) => [decodeBlank(d)]],
	[RecordType.MULBLANK, (d) => decodeMulBlank(d)],
	[RecordType.BOOLERR, (d) => [decodeBoolErr(d)]]
]);
function decodeSheet(records, boundSheet, offsetToIndex, globals) {
	const ctx = {
		sharedStrings: globals.sharedStrings,
		numeric: globals.numeric
	};
	const cells = collectCells(records, offsetToIndex.get(boundSheet.offset), ctx);
	return {
		name: boundSheet.name,
		visibility: boundSheet.visibility,
		rows: toGrid(cells)
	};
}
function collectCells(records, start, ctx) {
	if (start === void 0) return [];
	const cells = [];
	let pending = null;
	for (let i = start + 1; i < records.length; i++) {
		const record = records[i];
		if (record === void 0 || record.type === RecordType.EOF) break;
		pending = handleRecord(record, cells, pending, ctx);
	}
	return cells;
}
function handleRecord(record, cells, pending, ctx) {
	if (record.type === RecordType.STRING && pending) {
		cells.push({
			...pending,
			value: readUnicodeString(new ByteReader(record.data), false)
		});
		return null;
	}
	if (record.type === RecordType.FORMULA) return appendFormula(record.data, cells, ctx);
	const decode = DECODERS.get(record.type);
	if (decode) cells.push(...decode(record.data, ctx));
	return null;
}
function appendFormula(data, cells, ctx) {
	const result = decodeFormula(data, ctx);
	if (result.kind === "value") {
		cells.push(result.cell);
		return null;
	}
	return {
		row: result.row,
		col: result.col
	};
}
const MAX_ROW = 65535;
const MAX_COL = 255;
function toGrid(cells) {
	if (cells.length === 0) return [];
	const maxRow = cells.reduce((max, cell) => Math.max(max, cell.row), 0);
	const maxCol = cells.reduce((max, cell) => Math.max(max, cell.col), 0);
	if (maxRow > MAX_ROW || maxCol > MAX_COL) throw new XlsError(`Corrupt sheet: cell position (row ${maxRow}, col ${maxCol}) exceeds the BIFF8 limit of 65536 rows × 256 columns`);
	const rows = Array.from({ length: maxRow + 1 }, () => new Array(maxCol + 1).fill(null));
	for (const cell of cells) {
		const row = rows[cell.row];
		if (row) row[cell.col] = cell.value;
	}
	return rows;
}

//#endregion
//#region src/excel-serial-date.ts
const MS_PER_DAY = 864e5;
function excelSerialToDate(serial, date1904) {
	return new Date((date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30)) + serial * MS_PER_DAY);
}

//#endregion
//#region src/biff/number-format.ts
const BUILTIN_DATE_FORMAT_IDS = /* @__PURE__ */ new Set([
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	21,
	22,
	27,
	28,
	29,
	30,
	31,
	32,
	33,
	34,
	35,
	36,
	45,
	46,
	47,
	50,
	51,
	52,
	53,
	54,
	55,
	56,
	57,
	58
]);
function isDateFormatIndex(formatIndex, customFormats) {
	if (BUILTIN_DATE_FORMAT_IDS.has(formatIndex)) return true;
	const format = customFormats.get(formatIndex);
	return format !== void 0 && looksLikeDateFormat(format);
}
function looksLikeDateFormat(format) {
	const stripped = format.replace(/\\./g, "").replace(/"[^"]*"/g, "").replace(/\[[^\]]*\]/g, "");
	return /[ymdhs]/i.test(stripped);
}

//#endregion
//#region src/biff/continued-reader.ts
var ContinuedReader = class {
	constructor(chunks) {
		this.chunks = chunks;
		this.chunkIndex = 0;
		this.offset = 0;
	}
	get done() {
		this.settle();
		return this.chunkIndex >= this.chunks.length;
	}
	u8() {
		this.settle();
		return this.rawByte();
	}
	u16() {
		return this.u8() | this.u8() << 8;
	}
	u32() {
		return (this.u16() | this.u16() << 16) >>> 0;
	}
	readChars(count, wide) {
		let text = "";
		let isWide = wide;
		for (let i = 0; i < count; i++) {
			if (this.atChunkEnd()) isWide = (this.crossToNextChunk() & 1) !== 0;
			text += String.fromCharCode(isWide ? this.rawByte() | this.rawByte() << 8 : this.rawByte());
		}
		return text;
	}
	skip(length) {
		let left = length;
		while (left > 0) {
			this.settle();
			const chunk = this.currentChunk();
			const take = Math.min(left, chunk.length - this.offset);
			this.offset += take;
			left -= take;
		}
	}
	settle() {
		while (this.chunkIndex < this.chunks.length && this.offset >= this.chunkLength()) {
			this.chunkIndex += 1;
			this.offset = 0;
		}
	}
	atChunkEnd() {
		return this.chunkIndex < this.chunks.length && this.offset >= this.chunkLength();
	}
	crossToNextChunk() {
		this.chunkIndex += 1;
		this.offset = 0;
		return this.rawByte();
	}
	rawByte() {
		const value = this.currentChunk()[this.offset];
		if (value === void 0) throw new XlsError(`SST cursor past end of chunk ${this.chunkIndex} (offset ${this.offset})`);
		this.offset += 1;
		return value;
	}
	chunkLength() {
		return this.currentChunk().length;
	}
	currentChunk() {
		const chunk = this.chunks[this.chunkIndex];
		if (chunk === void 0) throw new XlsError(`SST reader ran past its ${this.chunks.length} chunk(s)`);
		return chunk;
	}
};

//#endregion
//#region src/biff/shared-strings.ts
const F_WIDE = 1;
const F_EXT = 4;
const F_RICH = 8;
const BYTES_PER_RUN = 4;
function parseSharedStrings(chunks) {
	const reader = new ContinuedReader(chunks);
	reader.u32();
	const unique = reader.u32();
	const strings = [];
	for (let i = 0; i < unique; i++) strings.push(readString(reader));
	return strings;
}
function readString(reader) {
	const charCount = reader.u16();
	const flags = reader.u8();
	const runCount = (flags & F_RICH) !== 0 ? reader.u16() : 0;
	const extSize = (flags & F_EXT) !== 0 ? reader.u32() : 0;
	const text = reader.readChars(charCount, (flags & F_WIDE) !== 0);
	reader.skip(runCount * BYTES_PER_RUN + extSize);
	return text;
}

//#endregion
//#region src/biff/workbook-globals.ts
function parseGlobals(records) {
	let date1904 = false;
	const customFormats = /* @__PURE__ */ new Map();
	const xfFormatIndex = [];
	let sharedStrings = [];
	const boundSheets = [];
	for (let i = 0; i < records.length; i++) {
		const record = records[i];
		if (record === void 0 || record.type === RecordType.EOF) break;
		if (record.type === RecordType.DATEMODE) date1904 = new ByteReader(record.data).u16() === 1;
		else if (record.type === RecordType.FORMAT) addFormat(record.data, customFormats);
		else if (record.type === RecordType.XF) xfFormatIndex.push(new ByteReader(record.data, 2).u16());
		else if (record.type === RecordType.SST) sharedStrings = parseSharedStrings(collectSstChunks(records, i));
		else if (record.type === RecordType.BOUNDSHEET8) boundSheets.push(parseBoundSheet(record.data));
	}
	return {
		sharedStrings,
		boundSheets,
		numeric: makeNumeric(xfFormatIndex, customFormats, date1904)
	};
}
function addFormat(data, into) {
	const reader = new ByteReader(data);
	const formatIndex = reader.u16();
	into.set(formatIndex, readUnicodeString(reader, false));
}
function collectSstChunks(records, sstIndex) {
	const first = records[sstIndex];
	const chunks = first ? [first.data] : [];
	for (let j = sstIndex + 1; j < records.length; j++) {
		const record = records[j];
		if (record === void 0 || record.type !== RecordType.CONTINUE) break;
		chunks.push(record.data);
	}
	return chunks;
}
function parseBoundSheet(data) {
	const reader = new ByteReader(data);
	const offset = reader.u32();
	const grbit = reader.u16();
	return {
		name: readUnicodeString(reader, true),
		offset,
		...decodeSheetGrbit(grbit)
	};
}
function decodeSheetGrbit(grbit) {
	return {
		visibility: VISIBILITY_BY_STATE[grbit & 3] ?? "visible",
		isWorksheet: (grbit >> 8 & 255) === 0
	};
}
const VISIBILITY_BY_STATE = {
	0: "visible",
	1: "hidden",
	2: "very-hidden"
};
function makeNumeric(xfFormatIndex, customFormats, date1904) {
	return (xfIndex, value) => {
		return isDateFormatIndex(xfFormatIndex[xfIndex] ?? 0, customFormats) ? excelSerialToDate(value, date1904) : value;
	};
}

//#endregion
//#region src/biff/parse-workbook.ts
function parseWorkbook(stream) {
	const records = readRecords(stream);
	const globals = parseGlobals(records);
	const offsetToIndex = new Map(records.map((record, index) => [record.offset, index]));
	return { sheets: globals.boundSheets.filter((sheet) => sheet.isWorksheet).map((sheet) => decodeSheet(records, sheet, offsetToIndex, globals)) };
}

//#endregion
//#region src/cfb/cfb-header.ts
const SIGNATURE = [
	208,
	207,
	17,
	224,
	161,
	177,
	26,
	225
];
function parseCfbHeader(bytes) {
	assertSignature(bytes);
	const reader = new ByteReader(bytes, 30);
	const sectorSize = powerOfTwoSize(reader.u16(), "sector", [9, 12]);
	const miniSectorSize = powerOfTwoSize(reader.u16(), "mini-sector", [6]);
	reader.position = 44;
	reader.u32();
	const firstDirSector = reader.u32();
	reader.u32();
	const miniStreamCutoff = reader.u32();
	const firstMiniFatSector = reader.u32();
	reader.u32();
	return {
		sectorSize,
		miniSectorSize,
		firstDirSector,
		miniStreamCutoff,
		firstMiniFatSector,
		firstDifatSector: reader.u32(),
		numDifatSectors: reader.u32(),
		initialDifat: readInitialDifat(bytes)
	};
}
function powerOfTwoSize(shift, kind, allowed) {
	if (!allowed.includes(shift)) throw new XlsError(`Invalid CFB ${kind} shift ${shift}: expected one of [${allowed.join(", ")}]`);
	return 1 << shift;
}
function readInitialDifat(bytes) {
	const reader = new ByteReader(bytes, 76);
	const entries = [];
	for (let i = 0; i < 109; i++) entries.push(reader.u32());
	return entries;
}
function assertSignature(bytes) {
	if (bytes.length < 512) throw new XlsError(`File too small to be an OLE2 container: ${bytes.length} bytes (need >= 512)`);
	for (let i = 0; i < SIGNATURE.length; i++) if (bytes[i] !== SIGNATURE[i]) throw new XlsError(`Not an OLE2 / .xls file: expected magic D0CF11E0A1B11AE1, got ${Array.from(bytes.slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join(" ")}`);
}

//#endregion
//#region src/cfb/directory.ts
const DIRECTORY_ENTRY_SIZE = 128;
const OBJECT_TYPE_ROOT = 5;
function parseDirectory(directoryBytes) {
	const entries = [];
	const count = Math.floor(directoryBytes.length / DIRECTORY_ENTRY_SIZE);
	for (let i = 0; i < count; i++) {
		const entry = parseEntry(directoryBytes.subarray(i * DIRECTORY_ENTRY_SIZE));
		if (entry) entries.push(entry);
	}
	return entries;
}
function findRoot(entries) {
	return entries.find((entry) => entry.objectType === OBJECT_TYPE_ROOT);
}
function parseEntry(entryBytes) {
	const reader = new ByteReader(entryBytes);
	const nameBytes = reader.slice(64);
	const nameLength = reader.u16();
	const objectType = reader.u8();
	if (objectType === 0) return null;
	reader.position = 116;
	const startSector = reader.u32();
	const size = reader.u32();
	return {
		name: decodeName(nameBytes, nameLength),
		objectType,
		startSector,
		size
	};
}
function decodeName(nameBytes, byteLength) {
	const chars = Math.max(0, byteLength / 2 - 1);
	const reader = new ByteReader(nameBytes);
	let name = "";
	for (let i = 0; i < chars; i++) name += String.fromCharCode(reader.u16());
	return name;
}

//#endregion
//#region src/cfb/sector-chains.ts
const ENDOFCHAIN = 4294967294;
const FREESECT = 4294967295;
function sectorOffset(id, sectorSize) {
	return (id + 1) * sectorSize;
}
function buildFat(bytes, header) {
	const fatSectorIds = collectFatSectorIds(bytes, header);
	const fat = [];
	const perSector = header.sectorSize / 4;
	for (const id of fatSectorIds) {
		const reader = new ByteReader(bytes, sectorOffset(id, header.sectorSize));
		for (let i = 0; i < perSector; i++) fat.push(reader.u32());
	}
	return fat;
}
function collectFatSectorIds(bytes, header) {
	const ids = header.initialDifat.filter((id) => id !== FREESECT && id !== ENDOFCHAIN);
	const perSector = header.sectorSize / 4;
	const seen = /* @__PURE__ */ new Set();
	let difatSector = header.firstDifatSector;
	for (let n = 0; n < header.numDifatSectors && difatSector !== ENDOFCHAIN && !seen.has(difatSector); n++) {
		seen.add(difatSector);
		const reader = new ByteReader(bytes, sectorOffset(difatSector, header.sectorSize));
		for (let i = 0; i < perSector - 1; i++) {
			const id = reader.u32();
			if (id !== FREESECT && id !== ENDOFCHAIN) ids.push(id);
		}
		difatSector = reader.u32();
	}
	return ids;
}
function followChain(fat, start) {
	const chain = [];
	const seen = /* @__PURE__ */ new Set();
	let current = start;
	while (current !== ENDOFCHAIN && current < fat.length && !seen.has(current)) {
		seen.add(current);
		chain.push(current);
		current = fat[current] ?? ENDOFCHAIN;
	}
	return chain;
}
function readChainBytes(bytes, chain, sectorSize, size) {
	const out = new Uint8Array(chain.length * sectorSize);
	chain.forEach((id, index) => {
		const start = sectorOffset(id, sectorSize);
		out.set(bytes.subarray(start, start + sectorSize), index * sectorSize);
	});
	return out.subarray(0, size);
}

//#endregion
//#region src/cfb/compound-file.ts
function openCompoundFile(bytes) {
	const header = parseCfbHeader(bytes);
	const fat = buildFat(bytes, header);
	const directory = parseDirectory(directoryBytes(bytes, header, fat));
	const file = {
		bytes,
		header,
		fat,
		directory,
		miniStream: readMiniStreamContainer(bytes, header, fat, directory),
		miniFat: buildMiniFat(bytes, header, fat)
	};
	return { readStream(name) {
		const entry = directory.find((e) => e.name === name);
		if (!entry) return void 0;
		return entry.size < header.miniStreamCutoff ? readMiniStream(file, entry) : readRegularStream(file, entry);
	} };
}
function directoryBytes(bytes, header, fat) {
	const chain = followChain(fat, header.firstDirSector);
	return readChainBytes(bytes, chain, header.sectorSize, chain.length * header.sectorSize);
}
function readRegularStream(file, entry) {
	const chain = followChain(file.fat, entry.startSector);
	return readChainBytes(file.bytes, chain, file.header.sectorSize, entry.size);
}
function readMiniStreamContainer(bytes, header, fat, directory) {
	const root = findRoot(directory);
	if (!root) return /* @__PURE__ */ new Uint8Array(0);
	return readChainBytes(bytes, followChain(fat, root.startSector), header.sectorSize, root.size);
}
function buildMiniFat(bytes, header, fat) {
	const chain = followChain(fat, header.firstMiniFatSector);
	return toU32Array(readChainBytes(bytes, chain, header.sectorSize, chain.length * header.sectorSize));
}
function readMiniStream(file, entry) {
	const { miniStream, miniFat, header } = file;
	const chain = followChain(miniFat, entry.startSector);
	const out = new Uint8Array(chain.length * header.miniSectorSize);
	chain.forEach((id, index) => {
		const start = id * header.miniSectorSize;
		out.set(miniStream.subarray(start, start + header.miniSectorSize), index * header.miniSectorSize);
	});
	return out.subarray(0, entry.size);
}
function toU32Array(raw) {
	const reader = new ByteReader(raw);
	const values = [];
	const count = Math.floor(raw.length / 4);
	for (let i = 0; i < count; i++) values.push(reader.u32());
	return values;
}

//#endregion
//#region src/reader.ts
function readXls(data) {
	const cfb = openCompoundFile(toBytes(data));
	const stream = cfb.readStream("Workbook") ?? cfb.readStream("Book");
	if (!stream) throw new XlsError("No 'Workbook' or 'Book' stream in the OLE2 file — not a BIFF .xls workbook");
	return parseWorkbook(stream);
}
function readFirstSheet(data) {
	return readXls(data).sheets[0];
}
function toBytes(data) {
	return data instanceof Uint8Array ? data : new Uint8Array(data);
}

//#endregion
//#region src/sheet-to-objects.ts
function sheetToObjects(sheet, options = {}) {
	const headerRow = options.headerRow ?? 0;
	assertHeaderRow(headerRow);
	const header = sheet.rows[headerRow];
	if (header === void 0) return [];
	const keys = headerKeys(header);
	return sheet.rows.slice(headerRow + 1).map((row) => rowToObject(row, keys));
}
function headerKeys(row) {
	return row.map((cell) => toKey(cell));
}
function toKey(cell) {
	if (cell === null) return null;
	const key = String(cell).trim();
	return key.length === 0 ? null : key;
}
function rowToObject(row, keys) {
	const object = {};
	keys.forEach((key, col) => {
		if (key === null) return;
		object[key] = row[col] ?? null;
	});
	return object;
}
function assertHeaderRow(headerRow) {
	if (Number.isInteger(headerRow) && headerRow >= 0) return;
	throw new XlsError(`headerRow must be a non-negative integer, got ${JSON.stringify(headerRow)}`);
}

//#endregion
//#region src/sheet-to-csv.ts
function sheetToCsv(sheet, options = {}) {
	const delimiter = options.delimiter ?? ",";
	const eol = options.eol ?? "\n";
	assertDelimiter(delimiter);
	return sheet.rows.map((row) => encodeRow(row, delimiter)).join(eol);
}
function encodeRow(row, delimiter) {
	return row.map((cell) => encodeField(cellToText(cell), delimiter)).join(delimiter);
}
function cellToText(cell) {
	if (cell === null) return "";
	if (cell instanceof Date) return cell.toISOString();
	if (cell instanceof CellError) return cell.code;
	return String(cell);
}
function encodeField(text, delimiter) {
	if (!text.includes(delimiter) && !/["\r\n]/.test(text)) return text;
	return `"${text.replace(/"/g, "\"\"")}"`;
}
function assertDelimiter(delimiter) {
	if (delimiter.length === 1 && !/["\r\n]/.test(delimiter)) return;
	throw new XlsError(`delimiter must be a single character other than '"', CR, or LF, got ${JSON.stringify(delimiter)}`);
}

//#endregion
export { CellError, XlsError, excelSerialToDate, readFirstSheet, readXls, sheetToCsv, sheetToObjects };
