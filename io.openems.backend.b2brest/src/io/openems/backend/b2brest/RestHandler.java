package io.openems.backend.b2brest;

import static org.osgi.service.component.annotations.ReferenceCardinality.MULTIPLE;
import static org.osgi.service.component.annotations.ReferencePolicy.DYNAMIC;
import static org.osgi.service.component.annotations.ReferencePolicyOption.GREEDY;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.eclipse.jetty.ee11.servlet.ServletContextHandler;
import org.osgi.framework.Constants;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.common.utils.BehaviorSubject;
import jakarta.servlet.http.HttpServlet;

@Component(service = RestHandler.class)
public class RestHandler {

	public static final String SERVLET_PATH = "servlet.path";

	private final Logger log = LoggerFactory.getLogger(RestHandler.class);

	private record ServletHolder(String id, HttpServlet servlet, String path) {
	}

	private final List<ServletHolder> servlets = new CopyOnWriteArrayList<>();

	private final ReadWriteLock lock = new ReentrantReadWriteLock();
	private final BehaviorSubject<ServletContextHandler> contextHandlerSubject = new BehaviorSubject<>(
			new ServletContextHandler());

	@Reference(cardinality = MULTIPLE, policy = DYNAMIC, policyOption = GREEDY)
	void bindServlet(HttpServlet servlet, Map<String, ?> ref) {
		final var servicePid = String.valueOf(ref.get(Constants.SERVICE_ID));
		final var path = (String) ref.get(SERVLET_PATH);

		this.log.info("Binding {} with path '{}' and servicePid {}", servlet.getClass().getSimpleName(), path,
				servicePid);

		final var holder = new ServletHolder(servicePid, servlet, path);

		this.lock.readLock().lock();
		try {
			this.servlets.add(holder);
			this.contextHandlerSubject.getValue().addServlet(holder.servlet(), holder.path());
		} finally {
			this.lock.readLock().unlock();
		}
	}

	void unbindServlet(HttpServlet servlet, Map<String, ?> ref) {
		final var servicePid = String.valueOf(ref.get(Constants.SERVICE_ID));
		final var path = (String) ref.get(SERVLET_PATH);

		this.log.info("Unbinding {} with path '{}' and servicePid {}", servlet.getClass().getSimpleName(), path,
				servicePid);

		if (this.servlets.removeIf(s -> s.id.equals(servicePid))) {
			this.lock.writeLock().lock();
			try {
				final var contextHandler = new ServletContextHandler();
				for (var servletHolder : this.servlets) {
					contextHandler.addServlet(servletHolder.servlet(), servletHolder.path());
				}

				this.contextHandlerSubject.setValue(contextHandler);
			} finally {
				this.lock.writeLock().unlock();
			}
		}
	}

	public BehaviorSubject<ServletContextHandler> getContextHandlerSubject() {
		return this.contextHandlerSubject;
	}

}
