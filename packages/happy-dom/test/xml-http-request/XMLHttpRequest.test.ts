import XMLHttpRequest from '../../src/xml-http-request/XMLHttpRequest.js';
import Window from '../../src/window/Window.js';
import IWindow from '../../src/window/IWindow.js';
import XMLHttpRequestReadyStateEnum from '../../src/xml-http-request/XMLHttpRequestReadyStateEnum.js';
import XMLHttpResponseTypeEnum from '../../src/xml-http-request/XMLHttpResponseTypeEnum.js';
import ProgressEvent from '../../src/event/events/ProgressEvent.js';
import { TextDecoder } from 'util';
import Blob from '../../src/file/Blob.js';
import IDocument from '../../src/nodes/document/IDocument.js';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { Stream } from 'stream';
import SyncFetch from '../../src/fetch/SyncFetch.js';
import IResponse from '../../src/fetch/types/IResponse.js';
import ISyncResponse from '../../src/fetch/types/ISyncResponse.js';
import Fetch from '../../src/fetch/Fetch.js';
import Headers from '../../src/fetch/Headers.js';
import IHeaders from '../../src/fetch/types/IHeaders.js';
import DOMException from '../../src/exception/DOMException.js';
import DOMExceptionNameEnum from '../../src/exception/DOMExceptionNameEnum.js';
import * as PropertySymbol from '../../src/PropertySymbol.js';

const WINDOW_URL = 'https://localhost:8080';
const REQUEST_URL = '/path/to/resource/';
const FORBIDDEN_REQUEST_METHODS = ['TRACE', 'TRACK', 'CONNECT'];
const FORBIDDEN_REQUEST_HEADERS = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'content-transfer-encoding',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'via'
];

describe('XMLHttpRequest', () => {
	let window: IWindow;
	let request: XMLHttpRequest;

	beforeEach(() => {
		window = new Window({
			url: WINDOW_URL
		});
		request = new window.XMLHttpRequest();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('get status()', () => {
		it('Returns status for synchrounous requests.', () => {
			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() =>
					<ISyncResponse>{
						headers: <IHeaders>new Headers(),
						status: 201
					}
			);

			expect(request.status).toBe(0);

			request.open('GET', REQUEST_URL, false);
			request.send();

			expect(request.status).toBe(201);
		});

		it('Returns status for asynchrounous requests.', async () => {
			await new Promise((resolve) => {
				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () => <IResponse>{ headers: <IHeaders>new Headers(), status: 201 }
				);

				expect(request.status).toBe(0);

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(request.status).toBe(201);
					resolve(null);
				});

				request.send();
			});
		});
	});

	describe('get statusText()', () => {
		it('Returns status text for synchrounous requests.', () => {
			const statusText = 'Test';

			expect(request.statusText).toBe('');

			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() => <ISyncResponse>{ headers: <IHeaders>new Headers(), statusText }
			);

			request.open('GET', REQUEST_URL, false);
			request.send();

			expect(request.statusText).toBe(statusText);
		});

		it('Returns status text for asynchrounous requests.', async () => {
			await new Promise((resolve) => {
				const statusText = 'Test';

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () => <IResponse>{ headers: <IHeaders>new Headers(), statusText }
				);

				expect(request.statusText).toBe('');

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(request.statusText).toBe(statusText);
					resolve(null);
				});

				request.send();
			});
		});
	});

	describe('get response()', () => {
		it('Returns ArrayBuffer when "responseType" is set to "arrayBuffer".', async () => {
			await new Promise((resolve) => {
				const responseText = 'Test';

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{ headers: <IHeaders>new Headers(), body: Stream.Readable.from(generate()) }
				);

				request.responseType = XMLHttpResponseTypeEnum.arraybuffer;
				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(responseText).toBe(new TextDecoder().decode(<ArrayBuffer>request.response));
					resolve(null);
				});

				request.send();
			});
		});

		it('Returns Blob when "responseType" is set to "blob".', async () => {
			await new Promise((resolve) => {
				const responseText = 'Test';

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{ headers: <IHeaders>new Headers(), body: Stream.Readable.from(generate()) }
				);

				request.responseType = XMLHttpResponseTypeEnum.blob;
				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(responseText).toBe((<Blob>request.response)[PropertySymbol.buffer].toString());
					resolve(null);
				});

				request.send();
			});
		});

		it('Returns Document when "responseType" is set to "document".', async () => {
			await new Promise((resolve) => {
				const responseText = 'Test';

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{ headers: <IHeaders>new Headers(), body: Stream.Readable.from(generate()) }
				);

				request.responseType = XMLHttpResponseTypeEnum.document;
				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect((<IDocument>request.response).documentElement.outerHTML).toBe(
						'<html><head></head><body>Test</body></html>'
					);
					resolve(null);
				});

				request.send();
			});
		});

		it('Returns JSON when "responseType" is set to "json".', async () => {
			await new Promise((resolve) => {
				const responseText = '{ "key1": "value1", "key2": "value2" }';

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{ headers: <IHeaders>new Headers(), body: Stream.Readable.from(generate()) }
				);

				request.responseType = XMLHttpResponseTypeEnum.json;
				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(<object>request.response).toEqual({ key1: 'value1', key2: 'value2' });
					resolve(null);
				});

				request.send();
			});
		});

		it('Defaults to text.', async () => {
			await new Promise((resolve) => {
				const responseText = 'Test';

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{ headers: <IHeaders>new Headers(), body: Stream.Readable.from(generate()) }
				);

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(<string>request.response).toEqual(responseText);
					resolve(null);
				});

				request.send();
			});
		});
	});

	describe('get responseURL()', () => {
		it('Returns response URL for synchrounous requests.', () => {
			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() => <ISyncResponse>{ headers: <IHeaders>new Headers(), url: WINDOW_URL + REQUEST_URL }
			);

			expect(request.responseURL).toBe('');

			request.open('GET', REQUEST_URL, false);
			request.send();

			expect(request.responseURL).toBe(WINDOW_URL + REQUEST_URL);
		});

		it('Returns response URL for asynchrounous requests.', async () => {
			await new Promise((resolve) => {
				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () => <IResponse>{ headers: <IHeaders>new Headers(), url: WINDOW_URL + REQUEST_URL }
				);

				expect(request.responseURL).toBe('');

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(request.responseURL).toBe(WINDOW_URL + REQUEST_URL);
					resolve(null);
				});

				request.send();
			});
		});
	});

	describe('get readyState()', () => {
		it('Returns ready state for synchrounous requests.', () => {
			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() => <ISyncResponse>{ headers: <IHeaders>new Headers() }
			);

			expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.unsent);

			request.open('GET', REQUEST_URL, false);
			request.send();

			expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
		});

		it('Returns ready state for asynchrounous requests.', async () => {
			await new Promise((resolve) => {
				const responseText = 'test';

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{ headers: <IHeaders>new Headers(), body: Stream.Readable.from(generate()) }
				);

				let isProgressTriggered = false;

				expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.unsent);

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('progress', () => {
					isProgressTriggered = true;
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.headersRecieved);
				});

				request.addEventListener('load', () => {
					expect(isProgressTriggered).toBe(true);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					resolve(null);
				});

				request.send();
			});
		});
	});

	describe('get responseText()', () => {
		it('Returns response text for synchrounous requests.', () => {
			const responseText = 'test';

			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() => <ISyncResponse>{ headers: <IHeaders>new Headers(), body: Buffer.from(responseText) }
			);

			request.open('GET', REQUEST_URL, false);
			request.send();
			expect(request.responseText).toBe(responseText);
		});

		it('Returns response text for asynchrounous requests.', async () => {
			await new Promise((resolve) => {
				const responseText = 'test';
				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{
							headers: <IHeaders>new Headers(),
							body: Stream.Readable.from(generate())
						}
				);

				request.open('GET', REQUEST_URL, true);
				request.addEventListener('load', () => {
					expect(request.responseText).toBe(responseText);
					resolve(null);
				});
				request.send();
			});
		});

		it(`Throws an exception if responseType is not empty string or "${XMLHttpResponseTypeEnum.text}".`, () => {
			request.responseType = XMLHttpResponseTypeEnum.json;
			expect(() => request.responseText).toThrowError(
				`Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was '${XMLHttpResponseTypeEnum.json}').`
			);
		});
	});

	describe('set responseType()', () => {
		it('Sets response type.', () => {
			request.responseType = XMLHttpResponseTypeEnum.document;
			expect(request.responseType).toBe(XMLHttpResponseTypeEnum.document);
		});

		it(`Throws an exception if readyState is "loading".`, async () => {
			await new Promise((resolve) => {
				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () => <IResponse>{ headers: <IHeaders>new Headers() }
				);

				request.open('GET', REQUEST_URL, true);
				request.addEventListener('progress', () => {
					expect(() => (request.responseType = XMLHttpResponseTypeEnum.json)).toThrowError(
						`Failed to set the 'responseType' property on 'XMLHttpRequest': The object's state must be OPENED or UNSENT.`
					);
				});
				request.addEventListener('load', () => resolve(null));
				request.send();
			});
		});

		it(`Throws an exception if the request is synchrounous.`, () => {
			request.open('GET', REQUEST_URL, false);
			expect(() => (request.responseType = XMLHttpResponseTypeEnum.json)).toThrowError(
				`Failed to set the 'responseType' property on 'XMLHttpRequest': The response type cannot be changed for synchronous requests made from a document.`
			);
		});
	});

	describe('open()', () => {
		it('Opens a request.', () => {
			request.open('GET', REQUEST_URL, true);
			expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.opened);
		});

		it('Throws an exception for forbidden request methods.', () => {
			for (const forbiddenMethod of FORBIDDEN_REQUEST_METHODS) {
				expect(() => request.open(forbiddenMethod, REQUEST_URL, true)).toThrowError(
					`'${forbiddenMethod}' is not a valid HTTP method.`
				);
			}
		});

		it(`Throws an exception if the request is set to be synchronous and responseType is not ${XMLHttpResponseTypeEnum.text}.`, () => {
			request.responseType = XMLHttpResponseTypeEnum.json;
			expect(() => request.open('GET', REQUEST_URL, false)).toThrowError(
				`Failed to execute 'open' on 'XMLHttpRequest': Synchronous requests from a document must not set a response type.`
			);
		});
	});

	describe('setRequestHeader()', () => {
		it('Sets a request header on a synchronous request.', () => {
			let requestArgs: { headers: { [name: string]: string } } | null = null;

			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(function () {
				requestArgs = {
					headers: {
						'test-header': this.request.headers.get('test-header')
					}
				};
				return <ISyncResponse>{ headers: <IHeaders>new Headers() };
			});

			request.open('GET', REQUEST_URL, false);
			expect(request.setRequestHeader('test-header', 'test')).toBe(true);
			request.send();
			expect(requestArgs).toEqual({
				headers: {
					'test-header': 'test'
				}
			});
		});

		it('Sets a request header on an asynchrounous request.', async () => {
			await new Promise((resolve) => {
				let requestArgs: { headers: { [name: string]: string } } | null = null;

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					requestArgs = {
						headers: {
							'test-header': this.request.headers.get('test-header')
						}
					};
					return <IResponse>{ headers: <IHeaders>new Headers() };
				});

				request.open('GET', REQUEST_URL, true);
				expect(request.setRequestHeader('test-header', 'test')).toBe(true);
				request.addEventListener('load', () => {
					expect(requestArgs).toEqual({
						headers: {
							'test-header': 'test'
						}
					});
					resolve(null);
				});
				request.send();
			});
		});

		it('Does not set forbidden headers.', () => {
			request.open('GET', REQUEST_URL, true);
			for (const header of FORBIDDEN_REQUEST_HEADERS) {
				expect(request.setRequestHeader(header, 'test')).toBe(false);
			}
		});

		it(`Throws an exception if ready state is not "opened".`, () => {
			expect(() => request.setRequestHeader('key', 'value')).toThrowError(
				`Failed to execute 'setRequestHeader' on 'XMLHttpRequest': The object's state must be OPENED.`
			);
		});
	});

	describe('getResponseHeader()', () => {
		it('Returns response header for a synchrounous request.', () => {
			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() =>
					<ISyncResponse>{
						headers: <IHeaders>new Headers({
							key1: 'value1',
							key2: 'value2'
						})
					}
			);

			request.open('GET', REQUEST_URL, false);
			request.send();

			expect(request.getResponseHeader('key1')).toBe('value1');
			expect(request.getResponseHeader('key2')).toBe('value2');
			expect(request.getResponseHeader('key3')).toBe(null);
		});

		it('Returns response header for an asynchrounous request.', async () => {
			await new Promise((resolve) => {
				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{
							headers: <IHeaders>new Headers({
								key1: 'value1',
								key2: 'value2'
							})
						}
				);

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(request.getResponseHeader('key1')).toBe('value1');
					expect(request.getResponseHeader('key2')).toBe('value2');
					expect(request.getResponseHeader('key3')).toBe(null);

					resolve(null);
				});

				request.send();
			});
		});

		it('Returns null when there is no response.', () => {
			expect(request.getResponseHeader('key1')).toBe(null);
		});
	});

	describe('getAllResponseHeaders()', () => {
		it('Returns all response headers for a synchrounous request.', () => {
			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() =>
					<ISyncResponse>{
						headers: <IHeaders>new Headers({
							key1: 'value1',
							key2: 'value2'
						})
					}
			);

			request.open('GET', REQUEST_URL, false);
			request.send();

			expect(request.getAllResponseHeaders()).toBe('key1: value1\r\nkey2: value2');
		});

		it('Returns all response headers for an asynchrounous request.', async () => {
			await new Promise((resolve) => {
				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{
							headers: <IHeaders>new Headers({
								'Content-Length': '4',
								key1: 'value1',
								key2: 'value2'
							})
						}
				);

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					expect(request.getAllResponseHeaders()).toBe(
						'Content-Length: 4\r\nkey1: value1\r\nkey2: value2'
					);
					resolve(null);
				});

				request.send();
			});
		});

		it('Returns empty string when there is no response.', () => {
			expect(request.getAllResponseHeaders()).toBe('');
		});
	});

	describe('send()', () => {
		it('Throws an exception if the request has not been opened.', () => {
			expect(() => request.send()).toThrowError(
				`Failed to execute 'send' on 'XMLHttpRequest': Connection must be opened before send() is called.`
			);
		});

		it('Performs a synchronous GET request with the HTTP protocol.', () => {
			const windowURL = 'http://localhost:8080';
			const window = new Window({
				url: windowURL
			});
			const request = new window.XMLHttpRequest();
			const responseText = 'test';

			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() => <ISyncResponse>{ headers: <IHeaders>new Headers(), body: Buffer.from(responseText) }
			);

			request.open('GET', REQUEST_URL, false);

			request.send();

			expect(request.responseText).toBe(responseText);
		});

		it('Performs a synchronous GET request with the HTTPS protocol.', () => {
			const responseText = 'test';

			vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(
				() => <ISyncResponse>{ headers: <IHeaders>new Headers(), body: Buffer.from(responseText) }
			);

			request.open('GET', REQUEST_URL, false);

			request.send();

			expect(request.responseText).toBe(responseText);
		});

		it('Performs an asynchronous GET request with the HTTP protocol listening to the "loadend" event.', async () => {
			await new Promise((resolve) => {
				const responseText = 'test';
				const windowURL = 'http://localhost:8080';
				const window = new Window({
					url: windowURL
				});
				const request = new window.XMLHttpRequest();
				let requestArgs: { method: string; url: string };
				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					requestArgs = {
						method: this.request.method,
						url: this.request.url
					};
					return <IResponse>{
						headers: <IHeaders>new Headers({
							'Content-Length': String(responseText.length),
							'Content-Type': 'text/html'
						}),
						body: Stream.Readable.from(generate())
					};
				});

				request.open('GET', REQUEST_URL, true);

				let isProgressTriggered = false;

				request.addEventListener('progress', (event) => {
					isProgressTriggered = true;
					expect((<ProgressEvent>event).lengthComputable).toBe(true);
					expect((<ProgressEvent>event).loaded).toBe(responseText.length);
					expect((<ProgressEvent>event).total).toBe(responseText.length);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.headersRecieved);
				});

				request.addEventListener('loadend', () => {
					expect(requestArgs).toEqual({
						method: 'GET',
						url: windowURL + REQUEST_URL
					});
					expect(request.responseText).toBe(responseText);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					expect(isProgressTriggered).toBe(true);

					resolve(null);
				});

				request.send();
			});
		});

		it('Performs an asynchronous GET request with the HTTPS protocol and query string.', async () => {
			await new Promise((resolve) => {
				const responseText = 'http.request.body';
				const queryString = '?query=string';
				let requestArgs: { method: string; url: string };
				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					requestArgs = {
						method: this.request.method,
						url: this.request.url
					};
					return <IResponse>{
						headers: <IHeaders>new Headers({
							'Content-Length': String(responseText.length),
							'Content-Type': 'text/html'
						}),
						body: Stream.Readable.from(generate())
					};
				});

				request.open('GET', REQUEST_URL + queryString, true);

				let isProgressTriggered = false;

				request.addEventListener('progress', (event) => {
					isProgressTriggered = true;
					expect((<ProgressEvent>event).lengthComputable).toBe(true);
					expect((<ProgressEvent>event).loaded).toBe(responseText.length);
					expect((<ProgressEvent>event).total).toBe(responseText.length);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.headersRecieved);
				});

				request.addEventListener('load', () => {
					expect(requestArgs).toEqual({
						method: 'GET',
						url: WINDOW_URL + REQUEST_URL + queryString
					});
					expect(request.responseText).toBe(responseText);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					expect(isProgressTriggered).toBe(true);

					resolve(null);
				});

				request.send();
			});
		});

		it('Handles responses without content length.', async () => {
			await new Promise((resolve) => {
				const responseText = 'http.request.body';
				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(
					async () =>
						<IResponse>{
							headers: <IHeaders>new Headers(),
							body: Stream.Readable.from(generate())
						}
				);

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('progress', (event) => {
					expect((<ProgressEvent>event).lengthComputable).toBe(false);
					expect((<ProgressEvent>event).loaded).toBe(responseText.length);
					expect((<ProgressEvent>event).total).toBe(0);
					resolve(null);
				});

				request.send();
			});
		});

		it('Performs an asynchronous GET request with the HTTPS protocol.', async () => {
			await new Promise((resolve) => {
				const responseText = 'http.request.body';
				let requestArgs: { method: string; url: string };
				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					requestArgs = {
						method: this.request.method,
						url: this.request.url
					};
					return <IResponse>{
						headers: <IHeaders>new Headers({
							'Content-Length': String(responseText.length),
							'Content-Type': 'text/html'
						}),
						body: Stream.Readable.from(generate())
					};
				});

				request.open('GET', REQUEST_URL, true);

				let isProgressTriggered = false;

				request.addEventListener('progress', (event) => {
					isProgressTriggered = true;
					expect((<ProgressEvent>event).lengthComputable).toBe(true);
					expect((<ProgressEvent>event).loaded).toBe(responseText.length);
					expect((<ProgressEvent>event).total).toBe(responseText.length);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.headersRecieved);
				});

				request.addEventListener('load', () => {
					expect(requestArgs).toEqual({
						method: 'GET',
						url: WINDOW_URL + REQUEST_URL
					});
					expect(request.responseText).toBe(responseText);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					expect(isProgressTriggered).toBe(true);

					resolve(null);
				});

				request.send();
			});
		});

		it('Performs an asynchronous basic auth request with username and password.', async () => {
			await new Promise((resolve) => {
				const username = 'username';
				const password = 'password';
				const responseText = 'http.request.body';
				let requestArgs: { method: string; url: string; headers: { [name: string]: string } };

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					requestArgs = {
						method: this.request.method,
						url: this.request.url,
						headers: {
							Authorization: this.request.headers.get('Authorization')
						}
					};
					return <IResponse>{
						headers: <IHeaders>new Headers({
							'Content-Length': String(responseText.length),
							'Content-Type': 'text/html'
						}),
						body: Stream.Readable.from(generate())
					};
				});

				request.open('GET', REQUEST_URL, true, username, password);

				let isProgressTriggered = false;

				request.addEventListener('progress', (event) => {
					isProgressTriggered = true;
					expect((<ProgressEvent>event).lengthComputable).toBe(true);
					expect((<ProgressEvent>event).loaded).toBe(responseText.length);
					expect((<ProgressEvent>event).total).toBe(responseText.length);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.headersRecieved);
				});

				request.addEventListener('load', () => {
					expect(requestArgs).toEqual({
						method: 'GET',
						url: WINDOW_URL + REQUEST_URL,
						headers: {
							Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
						}
					});
					expect(request.responseText).toBe(responseText);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					expect(isProgressTriggered).toBe(true);

					resolve(null);
				});

				request.send();
			});
		});

		it('Performs an asynchronous basic auth request with only username.', async () => {
			await new Promise((resolve) => {
				const username = 'username';
				const responseText = 'http.request.body';
				let requestArgs: { method: string; url: string; headers: { [name: string]: string } };
				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					requestArgs = {
						method: this.request.method,
						url: this.request.url,
						headers: {
							Authorization: this.request.headers.get('Authorization')
						}
					};
					return <IResponse>{
						headers: <IHeaders>new Headers({
							'Content-Length': String(responseText.length),
							'Content-Type': 'text/html'
						}),
						body: Stream.Readable.from(generate())
					};
				});

				request.open('GET', REQUEST_URL, true, username);

				request.addEventListener('load', () => {
					expect(requestArgs).toEqual({
						method: 'GET',
						url: WINDOW_URL + REQUEST_URL,
						headers: {
							Authorization: `Basic ${Buffer.from(`${username}:`).toString('base64')}`
						}
					});
					expect(request.responseText).toBe(responseText);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);

					resolve(null);
				});

				request.send();
			});
		});

		it('Performs an asynchronous POST request.', async () => {
			await new Promise((resolve) => {
				const responseText = 'http.request.body';
				const body = 'Hello, world!\n';
				let requestArgs: { method: string; url: string; body: string };

				async function* generate(): AsyncGenerator<string> {
					yield responseText;
				}

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					const requestBody = await this.request.text();
					requestArgs = {
						method: this.request.method,
						url: this.request.url,
						body: requestBody
					};
					return <IResponse>{
						headers: <IHeaders>new Headers({
							'Content-Length': String(responseText.length),
							'Content-Type': 'text/html'
						}),
						body: Stream.Readable.from(generate())
					};
				});

				request.open('POST', REQUEST_URL, true);

				let isProgressTriggered = false;

				request.addEventListener('progress', (event) => {
					isProgressTriggered = true;
					expect((<ProgressEvent>event).lengthComputable).toBe(true);
					expect((<ProgressEvent>event).loaded).toBe(responseText.length);
					expect((<ProgressEvent>event).total).toBe(responseText.length);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.headersRecieved);
				});

				request.addEventListener('load', () => {
					expect(requestArgs).toEqual({
						method: 'POST',
						url: WINDOW_URL + REQUEST_URL,
						body
					});
					expect(request.responseText).toBe(responseText);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					expect(isProgressTriggered).toBe(true);

					resolve(null);
				});

				request.send(body);
			});
		});

		it('Handles error in request when performing an asynchronous request.', async () => {
			await new Promise((resolve) => {
				vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
					throw new Error('error');
				});

				request.open('GET', REQUEST_URL, true);

				request.addEventListener('load', () => {
					throw new Error('Load event should not be triggered.');
				});

				request.addEventListener('error', () => {
					expect(request.status).toBe(0);
					expect(request.statusText).toBe('');
					expect(request.responseText).toBe('');
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					resolve(null);
				});

				request.send();
			});
		});

		it('Handles error in response when performing a synchronous request.', async () => {
			await new Promise((resolve) => {
				vi.spyOn(SyncFetch.prototype, 'send').mockImplementation(function () {
					throw new Error('error');
				});

				request.open('GET', REQUEST_URL, false);

				request.addEventListener('error', () => {
					expect(request.status).toBe(0);
					expect(request.statusText).toBe('');
					expect(request.responseText).toBe('');
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
					resolve(null);
				});

				request.send();
			});
		});

		it('Handles Happy DOM asynchrounous tasks.', async () => {
			const responseText = 'responseText';
			async function* generate(): AsyncGenerator<string> {
				yield responseText;
			}

			vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
				await new Promise((resolve) => setTimeout(resolve, 2));
				return <IResponse>{
					headers: <IHeaders>new Headers(),
					body: Stream.Readable.from(generate())
				};
			});

			request.open('GET', REQUEST_URL, true);
			request.send();

			await window.happyDOM?.waitUntilComplete();

			expect(request.responseText).toBe(responseText);
		});
	});

	describe('abort()', () => {
		it('Aborts an asynchrounous request.', async () => {
			return await new Promise((resolve) => {
				let isAborted = false;

				vi.spyOn(Fetch.prototype, 'send').mockImplementation(function (): Promise<IResponse> {
					return new Promise((resolve, reject) => {
						const timeout = setTimeout(() => {
							resolve(<IResponse>{ headers: <IHeaders>new Headers() });
						}, 50);
						this.request.signal.addEventListener('abort', () => {
							isAborted = true;
							clearTimeout(timeout);
							reject(
								new DOMException('The operation was aborted.', DOMExceptionNameEnum.abortError)
							);
						});
					});
				});

				let isAbortTriggered = false;
				let isErrorTriggered = false;
				let isLoadEndTriggered = false;
				request.open('GET', REQUEST_URL, true);
				request.send();
				request.addEventListener('abort', () => {
					isAbortTriggered = true;
				});
				request.addEventListener('error', () => {
					isErrorTriggered = true;
				});
				request.addEventListener('loadend', () => {
					isLoadEndTriggered = true;
				});
				setTimeout(() => {
					request.abort();

					expect(isAbortTriggered).toBe(true);
					expect(isErrorTriggered).toBe(false);
					expect(isLoadEndTriggered).toBe(true);
					expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.unsent);
					expect(isAborted).toBe(true);

					resolve(null);
				});
			});
		});

		it('Waits for ongoing Happy DOM asynchrounous task.', async () => {
			const responseText = 'responseText';
			async function* generate(): AsyncGenerator<string> {
				yield responseText;
			}

			vi.spyOn(Fetch.prototype, 'send').mockImplementation(async function () {
				await new Promise((resolve) => setTimeout(resolve, 2));
				return <IResponse>{
					headers: <IHeaders>new Headers(),
					body: Stream.Readable.from(generate())
				};
			});

			request.open('GET', REQUEST_URL, true);
			request.send();

			await window.happyDOM?.waitUntilComplete();

			expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.done);
			expect(request.responseText).toBe(responseText);
		});

		it('Aborts an ongoing request when cancelling all Happy DOM asynchrounous tasks.', async () => {
			let isAborted = false;

			vi.spyOn(Fetch.prototype, 'send').mockImplementation(function (): Promise<IResponse> {
				return new Promise((resolve, reject) => {
					const timeout = setTimeout(() => {
						resolve(<IResponse>{ headers: <IHeaders>new Headers() });
					}, 50);
					this.request.signal.addEventListener('abort', () => {
						isAborted = true;
						clearTimeout(timeout);
						reject(new DOMException('The operation was aborted.', DOMExceptionNameEnum.abortError));
					});
				});
			});

			let isAbortTriggered = false;
			let isErrorTriggered = false;
			let isLoadEndTriggered = false;

			request.open('GET', REQUEST_URL, true);
			request.send();

			request.addEventListener('abort', () => {
				isAbortTriggered = true;
			});

			request.addEventListener('error', () => {
				isErrorTriggered = true;
			});

			request.addEventListener('loadend', () => {
				isLoadEndTriggered = true;
			});

			await window.happyDOM?.abort();

			expect(isAbortTriggered).toBe(true);
			expect(isErrorTriggered).toBe(false);
			expect(isLoadEndTriggered).toBe(true);
			expect(request.readyState).toBe(XMLHttpRequestReadyStateEnum.unsent);
			expect(isAborted).toBe(true);
		});
	});
});
