package io.openems.backend.oem.fenecon;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LatestTaskPerKeyExecutorTest {
	
	private static final Logger log = LoggerFactory.getLogger(LatestTaskPerKeyExecutorTest.class);

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
	
	@Test
	public void testMany() throws Exception {
		final var executor = new LatestTaskPerKeyExecutor<Integer>((ThreadPoolExecutor) Executors.newFixedThreadPool(1));
		
		final int keys = 5;
		
		final CountDownLatch lock = new CountDownLatch(1);
		final CountDownLatch done = new CountDownLatch(keys);
		final AtomicInteger counter = new AtomicInteger(0);
		
		executor.execute(-1, () -> { // Thread blocker
			try {
				lock.await();
			} catch (InterruptedException e) {
				log.error("Interrupted", e);
			}
		});
		
		for (int i = 0; i < 100000; i++) {
			executor.execute(i % keys, () -> {
				try {
					lock.await();
					counter.getAndIncrement();
					done.countDown();
				} catch (InterruptedException e) {
					log.error("Interrupted", e);
				}
			});
		}

		lock.countDown();
		done.await(100, TimeUnit.MILLISECONDS);
		assertEquals(keys, counter.get());
	}

}
