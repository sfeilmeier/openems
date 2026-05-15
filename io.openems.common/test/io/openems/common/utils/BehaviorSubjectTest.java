package io.openems.common.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.function.Consumer;

import org.junit.jupiter.api.Test;

class BehaviorSubjectTest {

	@Test
	void testSubscribe() {
		final var subject = new BehaviorSubject<>("");

		final Consumer<String> subscriber = mock();
		subject.subscribe(subscriber);
		verify(subscriber, times(1)).accept("");

		subject.setValue("newValue");
		verify(subscriber, times(1)).accept("newValue");
	}

	@Test
	void unsubscribe() {
		final var subject = new BehaviorSubject<>("");

		final Consumer<String> subscriber = mock();
		subject.subscribe(subscriber);
		verify(subscriber, times(1)).accept("");

		subject.unsubscribe(subscriber);
		subject.setValue("newValue");
		verify(subscriber, times(0)).accept("newValue");
	}

	@Test
	void getValue() {
		final var subject = new BehaviorSubject<>("value");
		assertEquals("value", subject.getValue());
	}

	@Test
	void setValue() {
		final var subject = new BehaviorSubject<>("value");
		assertEquals("value", subject.getValue());
		subject.setValue("newValue");
		assertEquals("newValue", subject.getValue());
	}

	@Test
	void updateValue() {
		final var subject = new BehaviorSubject<>("value");
		subject.updateValue(s -> s + "_updated");
		assertEquals("value_updated", subject.getValue());
	}

}