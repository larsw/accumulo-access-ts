import assert from "assert"
import { describe, it, expect } from "bun:test"

import { parse } from "./index"

describe("parse", () => {
    it("should parse a simple expression", () => {
        const fn = parse("A")
        assert(fn({ labels: new Set(["A"]) }))
        assert(!fn({ labels: new Set(["B"]) }))
    })

    it("should parse a simple expression with parens", () => {
        const fn = parse("(A)")
        assert(fn({ labels: new Set(["A"]) }))
        assert(!fn({ labels: new Set(["B"]) }))
    })

    it("should parse an expression with and", () => {
        const fn = parse("A & B")
        assert(fn({ labels: new Set(["A", "B"]) }))
        assert(!fn({ labels: new Set(["A"]) }))
        assert(!fn({ labels: new Set(["B"]) }))
    })

    it("should parse an expression with or", () => {
        const fn = parse("A | B")
        assert(fn({ labels: new Set(["A", "B"]) }))
        assert(fn({ labels: new Set(["A"]) }))
        assert(fn({ labels: new Set(["B"]) }))
        assert(!fn({ labels: new Set([]) }))
    })

    it("should parse an expression with and and or", () => {
        const fn = parse("A | (B & C)")
        assert(fn({ labels: new Set(["A", "B", "C"]) }))
        assert(fn({ labels: new Set(["A", "B"]) }))
        assert(fn({ labels: new Set(["A", "C"]) }))
        assert(fn({ labels: new Set(["A"]) }))
        assert(fn({ labels: new Set(["B", "C"]) }))
        assert(!fn({ labels: new Set(["B"]) }))
        assert(!fn({ labels: new Set(["C"]) }))
        assert(!fn({ labels: new Set([]) }))        
    })

    it("should throw an error on syntax errors", () => {
        expect(() => parse("A ^ B")).toThrow()
        expect(() => parse("| C")).toThrow()
        expect(() => parse("A &")).toThrow()
        expect(() => parse("A |")).toThrow()
        expect(() => parse("& A")).toThrow()
        expect(() => parse("| A")).toThrow()
        expect(() => parse("A & B &")).toThrow()
        expect(() => parse("A | B |")).toThrow()
        expect(() => parse("A & B |")).toThrow()
        expect(() => parse("A | B &")).toThrow()
        expect(() => parse("A & B | C &")).toThrow()
        expect(() => parse("A | B & C |")).toThrow()

    })
})