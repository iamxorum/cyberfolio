// JSON.stringify doesn't escape `<`, so a value containing `</script>` would
// close the JSON-LD tag early. Escape the HTML-significant characters (and the
// JS line separators) as \uXXXX — still valid JSON, identical when parsed.
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}
