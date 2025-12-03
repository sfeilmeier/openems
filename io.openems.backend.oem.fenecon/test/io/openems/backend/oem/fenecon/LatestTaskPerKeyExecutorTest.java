package io.openems.backend.oem.fenecon;

import static org.junit.Assert.assertTrue;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

import org.junit.Test;

public class LatestTaskPerKeyExecutorTest {

	@Test
	public void testNotRunDuplicate() throws Exception {
		final var executor = new LatestTaskPerKeyExecutor<String>((ThreadPoolExecutor) Executors.newFixedThreadPool(1));

		final var lock = new ReentrantLock();
		lock.lock();
		executor.execute("key", () -> {
			lock.lock();
		});

		final var neverCompleted = new CompletableFuture<Void>();
		executor.execute("key", () -> {
			neverCompleted.complete(null);
		});

		final var shouldCompleted = new CompletableFuture<Void>();
		executor.execute("key", () -> {
			shouldCompleted.complete(null);
		});
		lock.unlock();
		
		CompletableFuture.anyOf(neverCompleted, shouldCompleted) //
			.orTimeout(1, TimeUnit.SECONDS) //
			.join();
		
		final var hasNeverCompleted = neverCompleted.isDone();
		final var hasShouldCompleted = shouldCompleted.isDone();
		assertTrue("Only the latest task for the same key should be executed. shouldCompleted: " //
				+ hasShouldCompleted + ", neverCompleted: " + hasNeverCompleted, //
				hasShouldCompleted && !hasNeverCompleted);
		

		executor.shutdown();
	}

}
