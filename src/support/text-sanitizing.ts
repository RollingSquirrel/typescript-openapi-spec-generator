export function removeIrrelevantTextAndSplit(
  fileTextContent: string
): string[] {
  let remainingText = removeAllComments(fileTextContent);

  remainingText = remainingText.substring(
    findIndexOfClassOrInterface(remainingText)
  );

  remainingText = removeEverythingAfterEndOfFirstBody(remainingText);

  return getRelevantWords(remainingText);
}

function removeAllComments(text: string): string {
  const blockCommentRegExp = new RegExp(
    /\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/,
    "g"
  );

  const lineCommentRegExp = new RegExp(/(\/\/[^\n]*)/, "g");

  return text.replace(blockCommentRegExp, "").replace(lineCommentRegExp, "");
}

function removeEverythingAfterEndOfFirstBody(text: string): string {
  const bodyEndIndex = text.indexOf("}");

  if (bodyEndIndex < 0) {
    console.log(text);
    throw new Error("Invalid body!");
  }

  return text.slice(0, bodyEndIndex);
}

function getRelevantWords(textContent: string): string[] {
  const relevantWordsSanitized = [getModelName(textContent)];

  const words = removeEverythingBeforeStartOfFirstBody(textContent)
    .split(" ")
    .map((word) => word.trim());

  for (const word of words) {
    const sanitizedWord = sanitizeWord(word);

    if (isWordRelevant(sanitizedWord)) {
      relevantWordsSanitized.push(sanitizedWord);
    }
  }

  return relevantWordsSanitized;
}

function removeEverythingBeforeStartOfFirstBody(text: string): string {
  const bodyStartIndex = text.indexOf("{");

  if (bodyStartIndex < 0) {
    console.log(text);
    throw new Error("Invalid body!");
  }

  return text.slice(bodyStartIndex);
}

function getModelName(text: string) {
  const words = text.split(" ").map((word) => word.trim());

  const indexSchemaName = findIndexOfClassOrInterface(words) + 1;

  return sanitizeWord(words[indexSchemaName]);
}

function findIndexOfClassOrInterface(words: string | string[]): number {
  let index = words.indexOf("class");
  if (index < 0) {
    index = words.indexOf("interface");
  }

  return index;
}

function isWordRelevant(word: string): boolean {
  return (
    word.length !== 0 && !word.includes("class") && !word.includes("interface")
  );
}

function sanitizeWord(word: string): string {
  return word
    .replace("\r", "")
    .replace("\n", "")
    .replace("{", "")
    .replace("}", "");
}
