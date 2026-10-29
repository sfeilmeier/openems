package io.openems.backend.b2brest.servlet;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

public class DummyHttpServletResponse implements HttpServletResponse {

	private final Map<String, String> headers = new LinkedHashMap<>();
	private final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
	private PrintWriter writer;
	private String contentType;
	private String characterEncoding = StandardCharsets.UTF_8.name();
	private int status = HttpServletResponse.SC_OK;
	private boolean committed;

	@Override
	public void addCookie(Cookie cookie) {
		// empty
	}

	@Override
	public boolean containsHeader(String name) {
		return this.headers.containsKey(name);
	}

	@Override
	public String encodeURL(String url) {
		return url;
	}

	@Override
	public String encodeRedirectURL(String url) {
		return url;
	}

	@Override
	public void sendError(int sc, String msg) throws IOException {
		this.status = sc;
		this.outputStream.write(msg.getBytes(StandardCharsets.UTF_8));
		this.committed = true;
	}

	@Override
	public void sendError(int sc) throws IOException {
		this.status = sc;
		this.committed = true;
	}

	@Override
	public void sendRedirect(String location) throws IOException {
		this.status = HttpServletResponse.SC_FOUND;
		this.headers.put("Location", location);
	}

	@Override
	public void sendRedirect(String s, int i, boolean b) throws IOException {
		// empty
	}

	@Override
	public void setDateHeader(String name, long date) {
		this.headers.put(name, Long.toString(date));
	}

	@Override
	public void addDateHeader(String name, long date) {
		this.headers.put(name, Long.toString(date));
	}

	@Override
	public void setHeader(String name, String value) {
		this.headers.put(name, value);
	}

	@Override
	public void addHeader(String s, String s1) {
		// empty
	}

	@Override
	public void setIntHeader(String name, int value) {
		this.headers.put(name, Integer.toString(value));
	}

	@Override
	public void addIntHeader(String name, int value) {
		this.headers.put(name, Integer.toString(value));
	}

	@Override
	public void setStatus(int i) {
		this.status = i;
	}

	@Override
	public int getStatus() {
		return this.status;
	}

	@Override
	public String getHeader(String name) {
		return this.headers.get(name);
	}

	@Override
	public Collection<String> getHeaders(String name) {
		var value = this.headers.get(name);
		return value == null ? Collections.emptyList() : Collections.singletonList(value);
	}

	@Override
	public Collection<String> getHeaderNames() {
		return this.headers.keySet();
	}

	@Override
	public String getContentType() {
		return this.contentType;
	}

	@Override
	public ServletOutputStream getOutputStream() {
		return new ServletOutputStream() {
			@Override
			public void write(int b) throws IOException {
				DummyHttpServletResponse.this.outputStream.write(b);
			}

			@Override
			public boolean isReady() {
				return true;
			}

			@Override
			public void setWriteListener(WriteListener writeListener) {
				// empty
			}
		};
	}

	/**
	 * Gets the body as a String.
	 *
	 * @return the body as a String
	 */
	public String getBody() {
		if (this.writer != null) {
			this.writer.flush();
		}
		return this.outputStream.toString(StandardCharsets.UTF_8);
	}

	@Override
	public PrintWriter getWriter() throws IOException {
		if (this.writer == null) {
			this.writer = new PrintWriter(new OutputStreamWriter(this.outputStream, StandardCharsets.UTF_8), true);
		}
		return this.writer;
	}

	@Override
	public void setCharacterEncoding(String charset) {
		this.characterEncoding = charset;
	}

	@Override
	public String getCharacterEncoding() {
		return this.characterEncoding;
	}

	@Override
	public void setContentLength(int len) {
		// empty
	}

	@Override
	public void setContentLengthLong(long len) {
		// empty
	}

	@Override
	public void setContentType(String s) {
		this.contentType = s;
	}

	@Override
	public void setBufferSize(int size) {
		// empty
	}

	@Override
	public int getBufferSize() {
		return 8192;
	}

	@Override
	public void flushBuffer() throws IOException {
		if (this.writer != null) {
			this.writer.flush();
		}
		this.committed = true;
	}

	@Override
	public void resetBuffer() {
		this.outputStream.reset();
	}

	@Override
	public boolean isCommitted() {
		return this.committed;
	}

	@Override
	public void reset() {
		this.outputStream.reset();
		this.headers.clear();
		this.contentType = null;
		this.status = HttpServletResponse.SC_OK;
	}

	@Override
	public void setLocale(Locale loc) {
		// empty
	}

	@Override
	public Locale getLocale() {
		return Locale.ENGLISH;
	}

}
