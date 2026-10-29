package io.openems.backend.b2brest.servlet;

import static java.util.Collections.emptyList;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Collection;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Vector;

import io.openems.common.bridge.http.api.HttpMethod;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletConnection;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpUpgradeHandler;
import jakarta.servlet.http.Part;

public class DummyHttpServletRequest implements HttpServletRequest {

	private final Map<String, List<String>> headers = new LinkedHashMap<>();
	private String method = "GET";
	private String pathInfo = "/";
	private byte[] body = new byte[0];

	@Override
	public String getAuthType() {
		return "";
	}

	@Override
	public Cookie[] getCookies() {
		return new Cookie[0];
	}

	@Override
	public long getDateHeader(String s) {
		return 0;
	}

	@Override
	public String getHeader(String s) {
		final var header = this.headers.get(s);
		if (header == null) {
			return null;
		}
		return String.join(", ", header);
	}

	@Override
	public Enumeration<String> getHeaders(String s) {
		return new Vector<>(this.headers.getOrDefault(s, emptyList())).elements();
	}

	@Override
	public Enumeration<String> getHeaderNames() {
		return new Vector<>(this.headers.keySet()).elements();
	}

	public DummyHttpServletRequest setHeader(String name, String value) {
		return this.setHeader(name, List.of(value));
	}

	public DummyHttpServletRequest setHeader(String name, List<String> value) {
		this.headers.put(name, value);
		return this;
	}

	@Override
	public int getIntHeader(String s) {
		return 0;
	}

	@Override
	public String getMethod() {
		return this.method;
	}

	public DummyHttpServletRequest setMethod(String method) {
		this.method = method;
		return this;
	}

	public DummyHttpServletRequest setMethod(HttpMethod method) {
		return this.setMethod(method.name());
	}

	@Override
	public String getPathInfo() {
		return this.pathInfo;
	}

	public DummyHttpServletRequest setPathInfo(String pathInfo) {
		this.pathInfo = pathInfo;
		return this;
	}

	@Override
	public String getPathTranslated() {
		return "";
	}

	@Override
	public String getContextPath() {
		return "";
	}

	@Override
	public String getQueryString() {
		return "";
	}

	@Override
	public String getRemoteUser() {
		return "";
	}

	@Override
	public boolean isUserInRole(String s) {
		return false;
	}

	@Override
	public Principal getUserPrincipal() {
		return null;
	}

	@Override
	public String getRequestedSessionId() {
		return "";
	}

	@Override
	public String getRequestURI() {
		return "";
	}

	@Override
	public StringBuffer getRequestURL() {
		return null;
	}

	@Override
	public String getServletPath() {
		return null;
	}

	@Override
	public HttpSession getSession(boolean b) {
		return null;
	}

	@Override
	public HttpSession getSession() {
		return null;
	}

	@Override
	public String changeSessionId() {
		return "";
	}

	@Override
	public boolean isRequestedSessionIdValid() {
		return false;
	}

	@Override
	public boolean isRequestedSessionIdFromCookie() {
		return false;
	}

	@Override
	public boolean isRequestedSessionIdFromURL() {
		return false;
	}

	@Override
	public boolean authenticate(HttpServletResponse httpServletResponse) throws IOException, ServletException {
		return false;
	}

	@Override
	public void login(String s, String s1) throws ServletException {
		// empty
	}

	@Override
	public void logout() throws ServletException {
		// empty
	}

	@Override
	public Collection<Part> getParts() throws IOException, ServletException {
		return List.of();
	}

	@Override
	public Part getPart(String s) throws IOException, ServletException {
		return null;
	}

	@Override
	public <T extends HttpUpgradeHandler> T upgrade(Class<T> aClass) throws IOException, ServletException {
		return null;
	}

	@Override
	public Object getAttribute(String s) {
		return null;
	}

	@Override
	public Enumeration<String> getAttributeNames() {
		return null;
	}

	@Override
	public String getCharacterEncoding() {
		return "";
	}

	@Override
	public void setCharacterEncoding(String s) throws UnsupportedEncodingException {
		// empty
	}

	@Override
	public int getContentLength() {
		return 0;
	}

	@Override
	public long getContentLengthLong() {
		return 0;
	}

	@Override
	public String getContentType() {
		return "";
	}

	@Override
	public ServletInputStream getInputStream() throws IOException {
		return new ServletInputStream() {
			private final InputStream delegate = new ByteArrayInputStream(DummyHttpServletRequest.this.body);

			@Override
			public int read() throws IOException {
				return this.delegate.read();
			}

			@Override
			public boolean isFinished() {
				return false;
			}

			@Override
			public boolean isReady() {
				return true;
			}

			@Override
			public void setReadListener(jakarta.servlet.ReadListener readListener) {
				// empty
			}
		};
	}

	public DummyHttpServletRequest setBody(String s) {
		this.body = s == null ? new byte[0] : s.getBytes(StandardCharsets.UTF_8);
		return this;
	}

	@Override
	public String getParameter(String s) {
		return "";
	}

	@Override
	public Enumeration<String> getParameterNames() {
		return null;
	}

	@Override
	public String[] getParameterValues(String s) {
		return new String[0];
	}

	@Override
	public Map<String, String[]> getParameterMap() {
		return Map.of();
	}

	@Override
	public String getProtocol() {
		return "";
	}

	@Override
	public String getScheme() {
		return "";
	}

	@Override
	public String getServerName() {
		return "";
	}

	@Override
	public int getServerPort() {
		return 0;
	}

	@Override
	public BufferedReader getReader() throws IOException {
		return new BufferedReader(new InputStreamReader(new ByteArrayInputStream(this.body), StandardCharsets.UTF_8));
	}

	@Override
	public String getRemoteAddr() {
		return "";
	}

	@Override
	public String getRemoteHost() {
		return "";
	}

	@Override
	public void setAttribute(String s, Object o) {
		// empty
	}

	@Override
	public void removeAttribute(String s) {
		// empty
	}

	@Override
	public Locale getLocale() {
		return null;
	}

	@Override
	public Enumeration<Locale> getLocales() {
		return null;
	}

	@Override
	public boolean isSecure() {
		return false;
	}

	@Override
	public RequestDispatcher getRequestDispatcher(String s) {
		return null;
	}

	@Override
	public int getRemotePort() {
		return 0;
	}

	@Override
	public String getLocalName() {
		return "";
	}

	@Override
	public String getLocalAddr() {
		return "";
	}

	@Override
	public int getLocalPort() {
		return 0;
	}

	@Override
	public ServletContext getServletContext() {
		return null;
	}

	@Override
	public AsyncContext startAsync() throws IllegalStateException {
		return new AsyncContext() {
			@Override
			public ServletRequest getRequest() {
				return DummyHttpServletRequest.this;
			}

			@Override
			public ServletResponse getResponse() {
				return null;
			}

			@Override
			public boolean hasOriginalRequestAndResponse() {
				return true;
			}

			@Override
			public void dispatch() {
				// empty
			}

			@Override
			public void dispatch(String path) {
				// empty
			}

			@Override
			public void dispatch(ServletContext context, String path) {
				// empty
			}

			@Override
			public void complete() {
				// empty
			}

			@Override
			public void start(Runnable run) {
				run.run();
			}

			@Override
			public void addListener(jakarta.servlet.AsyncListener listener) {
				// empty
			}

			@Override
			public void addListener(jakarta.servlet.AsyncListener listener, ServletRequest request,
					ServletResponse response) {
				// empty
			}

			@Override
			public <T extends jakarta.servlet.AsyncListener> T createListener(Class<T> clazz) throws ServletException {
				return null;
			}

			@Override
			public void setTimeout(long timeout) {
				// empty
			}

			@Override
			public long getTimeout() {
				return 0;
			}
		};
	}

	@Override
	public AsyncContext startAsync(ServletRequest servletRequest, ServletResponse servletResponse)
			throws IllegalStateException {
		return this.startAsync();
	}

	@Override
	public boolean isAsyncStarted() {
		return false;
	}

	@Override
	public boolean isAsyncSupported() {
		return false;
	}

	@Override
	public AsyncContext getAsyncContext() {
		return null;
	}

	@Override
	public DispatcherType getDispatcherType() {
		return null;
	}

	@Override
	public String getRequestId() {
		return "";
	}

	@Override
	public String getProtocolRequestId() {
		return "";
	}

	@Override
	public ServletConnection getServletConnection() {
		return null;
	}

}
