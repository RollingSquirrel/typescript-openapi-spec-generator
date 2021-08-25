export function removeIrrelevantTextAndSplit(
  fileTextContent: string
): string[] {
  const blockCommentRegExp = new RegExp(
    /\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/
  );
  const lineCommentRegExp = new RegExp("(//.*)");
  const removedCommentsText = fileTextContent
    .replace(blockCommentRegExp, "")
    .replace(lineCommentRegExp, "");

  let relevantTextStartIndex = findIndexOfClassOrInterface(removedCommentsText);
  const relevantTextContent = removedCommentsText.substring(
    relevantTextStartIndex
  );

  return getRelevantWords(relevantTextContent);
}

function getRelevantWords(textContent: string): string[] {
  const words = textContent.split(" ").map((word) => word.trim());

  const relevantWordsSanitized = [];

  const indexSchemaName = findIndexOfClassOrInterface(words) + 1;
  relevantWordsSanitized.push(sanitizeWord(words[indexSchemaName]));

  // skip everything until opening brackets
  const schemaBodyWords = words.slice(words.indexOf("{"));

  for (const word of schemaBodyWords) {
    const sanitizedWord = sanitizeWord(word);

    if (isWordRelevant(sanitizedWord)) {
      relevantWordsSanitized.push(sanitizedWord);
    }
  }

  return relevantWordsSanitized;
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
