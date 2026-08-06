import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import type { Section, WritingTask, SpeakingTask } from '@/types/apiTypes';

export interface ExcelError {
  sheet: string;
  row: number;
  field: string;
  message: string;
}

export interface ExcelWarning {
  sheet: string;
  row: number;
  message: string;
}

export interface FullIELTSParseResult {
  isValid: boolean;
  errors: ExcelError[];
  warnings: ExcelWarning[];
  data: {
    title?: string;
    tags?: string[];
    listening?: { [taskNum: number]: Section[] };
    reading?: {
      sections: { [taskNum: number]: Section[] };
      paragraphs: { [taskNum: number]: string };
    };
    writing?: WritingTask[];
    speaking?: SpeakingTask[];
  };
}

/**
 * Normalizes answer string by trimming and splitting acceptable variations (/, \, |, —)
 */
export const normalizeAnswer = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();

  // Normalize true/false/not given shorthands
  const upper = str.toUpperCase();
  if (upper === 'T') return 'TRUE';
  if (upper === 'F') return 'FALSE';
  if (upper === 'NG') return 'NOT GIVEN';
  if (upper === 'Y') return 'YES';
  if (upper === 'N') return 'NO';

  return str;
};

/**
 * Safely converts any cell value to trimmed string
 */
const safeString = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
};

/**
 * Generates and downloads a complete 5-Sheet IELTS Test Excel Template using ExcelJS for native Data Validation Dropdowns
 */
export const generateFullIELTSExcelTemplate = async () => {
  const workbook = new ExcelJS.Workbook();

  // Sheet 0: General
  const wsGeneral = workbook.addWorksheet('0_General');
  wsGeneral.addRow(['Field', 'Value']);
  wsGeneral.addRow(['Test Title', 'IELTS Academic Practice Test 01']);
  wsGeneral.addRow(['Tags', 'Academic, Full Test, Cam 18']);

  // Sheet 1: Listening
  const wsListening = workbook.addWorksheet('1_Listening');
  wsListening.addRow([
    'Task Number (1-4)',
    'Section Number',
    'Question Type (multiple-choice / sentence-completion / dropdown / map-labeling)',
    'Introduction',
    'Question Number (1-40)',
    'Question Text',
    'Answer (use / for variants e.g. apple / an apple)',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Explanation',
  ]);
  wsListening.addRow([
    1,
    1,
    'sentence-completion',
    'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.',
    1,
    'Name of caller: John _____',
    'Smith / Smyth',
    '',
    '',
    '',
    '',
    'The caller says my last name is Smith.',
  ]);
  wsListening.addRow([
    1,
    1,
    'sentence-completion',
    'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.',
    2,
    'Contact number: 07700 _____',
    '900123 / 900 123',
    '',
    '',
    '',
    '',
    'Given in conversation.',
  ]);
  wsListening.addRow([
    2,
    1,
    'multiple-choice',
    'Choose the correct letter, A, B or C.',
    3,
    'What time does the museum open?',
    'B',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '',
    'The speaker mentions opening at 10 AM.',
  ]);

  // Data Validation for Listening Column C (C2:C100)
  for (let r = 2; r <= 100; r++) {
    wsListening.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"multiple-choice,sentence-completion,dropdown,map-labeling"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Question Type',
      error: 'Please select a valid question type from the dropdown list.',
    };
  }

  // Sheet 2: Reading
  const wsReading = workbook.addWorksheet('2_Reading');
  wsReading.addRow([
    'Task Number (1-3)',
    'Passage Paragraph / Text (Supports Alt+Enter)',
    'Section Number',
    'Question Type (multiple-choice / sentence-completion / dropdown)',
    'Introduction',
    'Question Number (1-40)',
    'Question Text',
    'Answer (e.g. TRUE / FALSE / NOT GIVEN or A/B/C/D)',
    'Option A / Headings',
    'Option B',
    'Option C',
    'Option D',
    'Explanation',
  ]);
  wsReading.addRow([
    1,
    'Paragraph A\nTechnology has transformed modern communications...\n\nParagraph B\nIn the 21st century...',
    1,
    'dropdown',
    'Do the following statements agree with the information given in Reading Passage 1?\nWrite TRUE, FALSE or NOT GIVEN.',
    1,
    'Modern communication relies on technology.',
    'TRUE',
    'TRUE',
    'FALSE',
    'NOT GIVEN',
    '',
    'Passage 1 Paragraph A states technology transformed communications.',
  ]);
  wsReading.addRow([
    1,
    '',
    1,
    'dropdown',
    'Do the following statements agree with the information given in Reading Passage 1?',
    2,
    'The 21st century saw a decline in internet usage.',
    'FALSE',
    'TRUE',
    'FALSE',
    'NOT GIVEN',
    '',
    'Passage contradicts this statement.',
  ]);

  // Data Validation for Reading Column D (D2:D100)
  for (let r = 2; r <= 100; r++) {
    wsReading.getCell(`D${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"multiple-choice,sentence-completion,dropdown,map-labeling"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Question Type',
      error: 'Please select a valid question type from the dropdown list.',
    };
  }

  // Sheet 3: Writing
  const wsWriting = workbook.addWorksheet('3_Writing');
  wsWriting.addRow(['Task Number (1-2)', 'Task Prompt / Question Text']);
  wsWriting.addRow([
    1,
    'The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
  ]);
  wsWriting.addRow([
    2,
    'Some people believe that university education should be free for everyone, while others think students should pay for their higher education.\n\nDiscuss both views and give your opinion.',
  ]);

  // Sheet 4: Speaking
  const wsSpeaking = workbook.addWorksheet('4_Speaking');
  wsSpeaking.addRow(['Part Number (1-3)', 'Topic / Title / Prompt', 'Questions / Cue Card Points (One per line)']);
  wsSpeaking.addRow([1, 'Hometown & Studies', 'Where is your hometown?\nWhat do you like most about your hometown?\nAre you a student or do you work?']);
  wsSpeaking.addRow([
    2,
    'Describe a memorable journey you took.',
    'You should say:\n- Where you went\n- Who you went with\n- What you did\nAnd explain why it was memorable.',
  ]);
  wsSpeaking.addRow([3, 'Travel and Tourism Discussion', 'Why do people like traveling?\nHow has tourism changed in recent decades?']);

  // Write and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Full_IELTS_Test_Template.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Parses full IELTS Excel file with edge case validations
 */
export const parseFullIELTSExcel = async (file: File): Promise<FullIELTSParseResult> => {
  const errors: ExcelError[] = [];
  const warnings: ExcelWarning[] = [];

  const result: FullIELTSParseResult['data'] = {
    listening: { 1: [], 2: [], 3: [], 4: [] },
    reading: {
      sections: { 1: [], 2: [], 3: [] },
      paragraphs: { 1: '', 2: '', 3: '' },
    },
    writing: [],
    speaking: [],
  };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array', raw: false, cellDates: false });

    // Parse Sheet 0: General
    const sheetGeneral = wb.Sheets['0_General'] || wb.Sheets[wb.SheetNames[0]];
    if (sheetGeneral) {
      const rows: any[][] = XLSX.utils.sheet_to_json(sheetGeneral, { header: 1 });
      rows.forEach((row) => {
        const label = safeString(row[0]).toLowerCase();
        if (label.includes('title')) result.title = safeString(row[1]);
        if (label.includes('tags')) {
          result.tags = safeString(row[1])
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        }
      });
    }

    // Helper to parse question rows for Listening/Reading
    const parseSkillQuestions = (
      sheetName: string,
      maxTasks: number
    ): { sections: { [key: number]: Section[] }; paragraphs?: { [key: number]: string } } => {
      const sheet = wb.Sheets[sheetName];
      const sectionsMap: { [key: number]: Section[] } = {};
      const paragraphsMap: { [key: number]: string } = {};

      for (let i = 1; i <= maxTasks; i++) {
        sectionsMap[i] = [];
        paragraphsMap[i] = '';
      }

      if (!sheet) return { sections: sectionsMap, paragraphs: paragraphsMap };

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (rows.length <= 1) return { sections: sectionsMap, paragraphs: paragraphsMap };

      const questionNumbersSeen = new Set<number>();

      let lastTaskNum = 1;
      let lastSecNum = 1;
      let lastQType = 'multiple-choice';
      let lastIntro = '';

      // Find explanation column index from header if available
      const headerRow: any[] = rows[0] || [];
      let expColIndex = -1;
      for (let c = 0; c < headerRow.length; c++) {
        const hHeader = safeString(headerRow[c]).toLowerCase();
        if (hHeader.includes('explanation') || hHeader.includes('giải thích')) {
          expColIndex = c;
          break;
        }
      }

      for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        if (!row || row.length === 0 || row.every((c) => c === undefined || c === '')) continue;

        const rowNumber = rowIndex + 1;
        
        // Auto-inherit Task Number if empty
        const rawTaskStr = safeString(row[0]);
        let taskNum = rawTaskStr ? parseInt(rawTaskStr, 10) : lastTaskNum;
        if (isNaN(taskNum) || taskNum < 1 || taskNum > maxTasks) {
          taskNum = lastTaskNum;
        } else {
          lastTaskNum = taskNum;
        }

        // Reading passage paragraph
        if (sheetName.includes('Reading')) {
          const passageText = safeString(row[1]);
          if (passageText && !paragraphsMap[taskNum]) {
            paragraphsMap[taskNum] = passageText;
          }
        }

        const offset = sheetName.includes('Reading') ? 1 : 0;
        
        // Auto-inherit Section Number if empty
        const rawSecStr = safeString(row[1 + offset]);
        let secNum = rawSecStr ? parseInt(rawSecStr, 10) : lastSecNum;
        if (isNaN(secNum)) {
          secNum = lastSecNum;
        } else {
          lastSecNum = secNum;
        }

        // Auto-inherit Question Type if empty
        const rawQType = safeString(row[2 + offset]).toLowerCase();
        let qType = lastQType;
        if (rawQType) {
          if (rawQType.includes('choice') || rawQType === 'mc') {
            qType = 'multiple-choice';
          } else if (rawQType.includes('completion') || rawQType.includes('fill') || rawQType.includes('short')) {
            qType = 'sentence-completion';
          } else if (rawQType.includes('dropdown') || rawQType.includes('matching') || rawQType.includes('true') || rawQType.includes('yes')) {
            qType = 'dropdown';
          } else if (rawQType.includes('map') || rawQType.includes('label') || rawQType.includes('diagram') || rawQType.includes('table')) {
            qType = 'map-labeling';
          } else {
            errors.push({
              sheet: sheetName,
              row: rowNumber,
              field: 'Question Type',
              message: `Unknown Question Type '${row[2 + offset]}'. Valid types: multiple-choice, sentence-completion, dropdown, map-labeling.`,
            });
            continue;
          }
          lastQType = qType;
        }

        // Auto-inherit Introduction if empty
        const rawIntro = safeString(row[3 + offset]);
        let introduction = rawIntro;
        if (rawIntro) {
          lastIntro = rawIntro;
        } else {
          introduction = lastIntro;
        }

        const qNumStr = safeString(row[4 + offset]);
        const questionText = safeString(row[5 + offset]);
        const rawAnswer = safeString(row[6 + offset]);

        // Determine options and explanation dynamically
        const startOptIdx = 7 + offset;
        let explanation = '';
        let rawOptions: string[] = [];

        if (expColIndex > startOptIdx) {
          explanation = safeString(row[expColIndex]);
          for (let c = startOptIdx; c < expColIndex; c++) {
            const optVal = safeString(row[c]);
            if (optVal) rawOptions.push(optVal);
          }
        } else {
          // Fallback if Explanation header wasn't found at expected index
          // Assume columns startOptIdx up to 10 + offset are options, 11 + offset is explanation
          for (let c = startOptIdx; c <= 10 + offset; c++) {
            const optVal = safeString(row[c]);
            if (optVal) rawOptions.push(optVal);
          }
          explanation = safeString(row[11 + offset]);
        }

        if (!qNumStr) {
          warnings.push({
            sheet: sheetName,
            row: rowNumber,
            message: `Row missing Question Number, skipped question.`,
          });
          continue;
        }

        const qNum = parseInt(qNumStr, 10);
        if (isNaN(qNum)) {
          errors.push({
            sheet: sheetName,
            row: rowNumber,
            field: 'Question Number',
            message: `Invalid question number '${qNumStr}'`,
          });
          continue;
        }

        if (questionNumbersSeen.has(qNum)) {
          warnings.push({
            sheet: sheetName,
            row: rowNumber,
            message: `Duplicate Question Number ${qNum} detected.`,
          });
        }
        questionNumbersSeen.add(qNum);

        const answer = normalizeAnswer(rawAnswer);
        const options = rawOptions;

        // Find or create section
        let taskSections = sectionsMap[taskNum];
        let section = taskSections.find((s) => s.sectionNumber === secNum);
        if (!section) {
          const newSec: Section = {
            sectionNumber: secNum,
            type: qType,
            introduction: introduction,
            questions: [],
          };
          taskSections.push(newSec);
          section = newSec;
        }

        section.questions.push({
          questionNumber: qNum,
          question: questionText,
          answer: answer,
          explanation: explanation,
          options: options.length > 0 ? options : ['', '', '', ''],
        });
      }

      return { sections: sectionsMap, paragraphs: paragraphsMap };
    };

    // Parse Listening
    const listeningParsed = parseSkillQuestions('1_Listening', 4);
    result.listening = listeningParsed.sections;

    // Parse Reading
    const readingParsed = parseSkillQuestions('2_Reading', 3);
    result.reading = {
      sections: readingParsed.sections,
      paragraphs: readingParsed.paragraphs || { 1: '', 2: '', 3: '' },
    };

    // Parse Writing
    const sheetWriting = wb.Sheets['3_Writing'];
    if (sheetWriting) {
      const rows: any[][] = XLSX.utils.sheet_to_json(sheetWriting, { header: 1 });
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;
        const prompt = safeString(row[1]);
        if (prompt) {
          result.writing!.push({ prompt });
        }
      }
    }

    // Parse Speaking
    const sheetSpeaking = wb.Sheets['4_Speaking'];
    if (sheetSpeaking) {
      const rows: any[][] = XLSX.utils.sheet_to_json(sheetSpeaking, { header: 1 });
      const speakingTasks: SpeakingTask[] = [
        { questions: [] },
        { cueCard: { topic: '', points: [] } },
        { questions: [] },
      ];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;
        const partNum = parseInt(safeString(row[0]), 10) || 1;
        const topic = safeString(row[1]);
        const content = safeString(row[2]);

        if (partNum === 1) {
          const qs = content.split('\n').map((q) => q.trim()).filter(Boolean);
          speakingTasks[0].questions = [...(speakingTasks[0].questions || []), ...qs];
        } else if (partNum === 2) {
          const points = content.split('\n').map((p) => p.trim()).filter(Boolean);
          speakingTasks[1].cueCard = { topic, points };
        } else if (partNum === 3) {
          const qs = content.split('\n').map((q) => q.trim()).filter(Boolean);
          speakingTasks[2].questions = [...(speakingTasks[2].questions || []), ...qs];
        }
      }
      result.speaking = speakingTasks;
    }
  } catch (err: any) {
    errors.push({
      sheet: 'File',
      row: 0,
      field: 'File Parsing',
      message: `Failed to read Excel file: ${err.message || String(err)}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: result,
  };
};
