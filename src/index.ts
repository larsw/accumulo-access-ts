import { buildLexer, expectEOF, expectSingleResult, rule, Token } from 'typescript-parsec'
import { alt, apply, kmid, lrec_sc, seq, str, tok } from 'typescript-parsec'

enum TokenKind {
    Label,
    And,
    Or,
    LParen,
    RParen,
    Whitespace,
}

const lexer = buildLexer([
    [true, /^[A-Za-z0-9_\-\.]+/g, TokenKind.Label],
    // single-quoted labels that supports escaped single quotes:
    [true, /^'[^'\\]*(?:\\.[^'\\]*)*'/g, TokenKind.Label],
    // double-quoted labels that supports escaped double quotes:
    [true, /^"[^"\\]*(?:\\.[^"\\]*)*"/g, TokenKind.Label],
    [true, /^\&/g, TokenKind.And],
    [true, /^\|/g, TokenKind.Or],
    [true, /^\(/g, TokenKind.LParen],
    [true, /^\)/g, TokenKind.RParen],
    [false, /^\s+/g, TokenKind.Whitespace]
])

/**
 * A function that evaluates a visibility expression.
 */
export type EvalFn = (ctx: EvaluationContext) => boolean

/**
 * A context that is passed to an EvalFn.
 */
export type EvaluationContext = {
    labels: Set<string>
}

const evaluateLabel = (token: Token<TokenKind.Label>): EvalFn => {
    return ctx => {
        let label = token.text
        if (label.startsWith("'") || label.startsWith('"')) {
            label = label.slice(1, -1)
        }
        return ctx.labels.has(label)
    }
}

const evaluateBinaryOperation = (first: EvalFn, second: [Token<TokenKind>, EvalFn]): EvalFn => {
    const token = second[0]
    const fn = second[1]
    switch (token.kind) {
        case TokenKind.And: return ctx => {

            return first(ctx) && fn(ctx)
        }
        case TokenKind.Or: return ctx => {
            return first(ctx) || fn(ctx)
        }
        default: throw new Error(`Unknown operator: ${token.text}`)
    }
}

const TERM = rule<TokenKind, EvalFn>()
const EXP = rule<TokenKind, EvalFn>()

// TERM = Label | '(' EXP ')'
TERM.setPattern(
    alt(
        apply(tok(TokenKind.Label), evaluateLabel),
        kmid(str('('), EXP, str(')'))
    )
)

// EXP = TERM | EXP ('&' | '|') TERM
EXP.setPattern(
    lrec_sc(TERM, seq(alt(tok(TokenKind.And), tok(TokenKind.Or)), TERM), evaluateBinaryOperation)
)

const lex = (expr: string) : Token<TokenKind> | undefined => lexer.parse(expr)

/**
 * Parses a visibility expression and returns an EvalFn.
 * @param expr The visibility expression to parse.
 * @returns An EvalFn that evaluates the visibility expression.
 */
export const parse = (expr: string): EvalFn => {
    return expectSingleResult(expectEOF(EXP.parse(lex(expr))))
}

