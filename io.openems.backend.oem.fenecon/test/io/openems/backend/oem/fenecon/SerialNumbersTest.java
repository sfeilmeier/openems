package io.openems.backend.oem.fenecon;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.Map;

import org.junit.Test;

public class SerialNumbersTest {

	@Test
	public void testAddSerialNumberOfExisting() {
		final var serialNumbers1 = new SerialNumbers(Map.of(//
				"comp0", Map.of("serialnumber1", "value") //
		));
		final var serialNumbers2 = new SerialNumbers(Map.of(//
				"comp0", Map.of("serialnumber1", "value", "serialnumber2", "value") //
		));

		final var diff = serialNumbers1.differenceTo(serialNumbers2);
		assertEquals(1, diff.values().size());
		final var component = diff.values().get("comp0");
		assertNotNull(component);
		assertEquals(1, component.size());
		assertEquals("value", component.get("serialnumber2"));
	}

	@Test
	public void testAddSerialNumberNewComponent() {
		final var serialNumbers1 = new SerialNumbers(Map.of(//
				"comp0", Map.of("serialnumber1", "value") //
		));
		final var serialNumbers2 = new SerialNumbers(Map.of(//
				"comp0", Map.of("serialnumber1", "value"), //
				"comp1", Map.of("serialnumber2", "value") //
		));

		final var diff = serialNumbers1.differenceTo(serialNumbers2);
		assertEquals(1, diff.values().size());
		final var component = diff.values().get("comp1");
		assertNotNull(component);
		assertEquals(1, component.size());
		assertEquals("value", component.get("serialnumber2"));
	}

	@Test
	public void testAddSerialNumberChangedValue() {
		final var serialNumbers1 = new SerialNumbers(Map.of(//
				"comp0", Map.of("serialnumber1", "value") //
		));
		final var serialNumbers2 = new SerialNumbers(Map.of(//
				"comp0", Map.of("serialnumber1", "value2") //
		));

		final var diff = serialNumbers1.differenceTo(serialNumbers2);
		assertEquals(1, diff.values().size());
		final var component = diff.values().get("comp0");
		assertNotNull(component);
		assertEquals(1, component.size());
		assertEquals("value2", component.get("serialnumber1"));
	}

}
