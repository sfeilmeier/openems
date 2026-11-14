# Pending Checkstyle checks — decision tracker

Tracking file for the Checkstyle checks that were **introduced in Checkstyle 14.1.0**
(vs. the previously used 11.1.0, see `checkstyle.toolVersion` in `gradle.properties`)
but are **not yet enabled** in `cnf/checkstyle.xml`. Decide for each check individually
whether to adopt it (and fix the listed violations) or reject it.

Already adopted in `cnf/checkstyle.xml` (zero violations on current code):
`LineEnding`, `MultilineCommentLeadingAsteriskPresence`, `ExpressionOverBlockLambda`,
`UnnecessaryTypeArgumentsWithRecordPattern`, `MissingOverrideOnRecordAccessor`,
`JavadocEndCommentDelimiter`, `WhitespaceBeforeEmptyBody`.

Violation counts were measured with Checkstyle 14.1.0 (CLI, default configuration of each
check) over all Java sources of the `io.openems.*` bundles (4,130 files, main + test,
excluding `com.dalsemi.onewire`). Because the build enforces zero warnings
(`maxWarnings = 0`), adopting a check means its violations must be fixed or the check
configured to match the project style first.

| Check | What it enforces (default) | Violations | Decision |
|---|---|---:|---|
| `TypeBodyPadding` | Blank line after opening and before closing brace of a type body | 2872 | pending |
| `JavadocLinkFirstOccurrence` | Only the first mention of a class should be a `{@link}`; later ones plain text | 2875 | pending |
| `GoogleMethodName` | Google-style method names (camelCase, no underscores) — conflicts with project `MethodName` pattern allowing `_` | 703 | pending |
| `PreferCodeOrSnippetJavadocInlineTag` | Prefer `{@code}`/`{@snippet}` over `<code>` in Javadoc | 411 | pending |
| `UnnecessaryFullyQualifiedType` | No fully qualified type names where an import would do | 203 | pending |
| `HexLiteralCase` | Hex literals must use uppercase letters (`0xFF`, not `0xff`) | 196 | pending |
| `UseEnhancedSwitch` | Use enhanced switch (arrow cases / switch expressions) instead of classic `switch` | 168 | pending |
| `TextBlockGoogleStyleFormatting` | Google-style formatting of text blocks | 163 | pending |
| `NumericalPrefixesInfixesSuffixesCharacterCase` | Consistent case of prefixes (`0x`/`0b`), separators and type suffixes (`L`/`f`/`d`) in numeric literals | 120 | pending |
| `JavadocLinkWellKnownApi` | Do not `{@link}` well-known JDK types (e.g. `String`) | 73 | pending |
| `JavadocParamOrder` | `@param` tags in the same order as the method parameters | 58 | pending |
| `PreferLiteralJavadocInlineTag` | Prefer `{@literal}` over `<tt>`/`<code>` for literal text | 55 | pending |
| `JavadocThrowsOrder` | `@throws` tags in the same order as the declared exceptions | 42 | pending |
| `IllegalSymbol` | No illegal symbols per default pattern (flags non-ASCII such as `→`, `≤`, `≥` used in comments) | 34 | pending |
| `UnusedPrivateField` | No unused private fields | 15 | pending |
| `AnnotatedDeclarationVisibility` | Annotated elements must not have `public` visibility | 6 | pending |
| `InappropriateJavadocBlockTagsOnField` | No method tags (`@param`/`@return`) on field Javadoc | 4 | pending |
| `ArrayBracketNoWhitespace` | No whitespace around array brackets (`String []` → `String[]`) | 2 | pending |
| `UnusedTryResourceShouldBeUnnamed` | Unused try-with-resources variables should be unnamed (`_`) | 1 | pending |
| `JavadocNoErrorInThrowsTag` | Do not document `Error` types in `@throws` | 1 | pending |
| `OpenjdkAnnotationLocation` | Annotation location per OpenJDK style — overlaps with existing `AnnotationLocation` config | 0 | pending |
| `InappropriateJavadocBlockTagsOnPackage` | No type/method tags on package Javadoc | 0 | pending |
| `InappropriateJavadocBlockTagsOnType` | No field/method tags on type Javadoc | 0 | pending |
| `IllegalBlockTag` | Disallow configured Javadoc block tags (default: no tags configured, i.e. no-op) | 0 | pending |
| `JavadocRegexp` | Custom pattern on Javadoc content (default: no pattern configured, i.e. no-op) | 0 | pending |
| `AvoidModuleImport` | `module-info.java` only — no `module-info.java` exists in the bundles | 0 | pending |
| `ModuleImportOrder` | `module-info.java` only — not applicable | 0 | pending |
| `ModuleDirectiveOrder` | `module-info.java` only — not applicable | 0 | pending |
| `GoogleNonConstantFieldName` | Google-style non-constant field names — conflicts with project naming patterns | 41 | pending |

Notes:

- `GoogleMethodName`/`GoogleNonConstantFieldName` directly conflict with the project's own
  `MethodName`/`MemberName` patterns (which allow underscores), so they are likely rejects.
- `IllegalSymbol` conflicts with the intentional use of Unicode arrows/comparison signs in
  comments; adopting it would require an allowlist of symbols.
- `HexLiteralCase` would require normalizing all existing hex literals to one case.
- The `module-info` checks can be rejected outright unless JPMS modules are introduced.
