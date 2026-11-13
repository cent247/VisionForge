import {test} from 'node:test';import assert from 'node:assert/strict';import {parseSrt,toSrt} from '../src/shared/captions.mjs';
test('SRT round trips multiline captions',()=>{const text='1\n00:00:01,100 --> 00:00:03,050\nHello\nworld\n';assert.equal(toSrt(parseSrt(text)),text);});
test('SRT rejects backwards timing and malformed timestamps',()=>{assert.throws(()=>parseSrt('1\n00:00:03,000 --> 00:00:01,000\nBad'));assert.throws(()=>parseSrt('1\n00:99:00,000 --> 00:99:01,000\nBad'));});
