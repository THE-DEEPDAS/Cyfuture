/**
 * Test script for demonstrating the improved LLM throttling mechanism
 *
 * This script makes multiple LLM API calls with various delay options to show
 * how the improved throttling mechanism works.
 */

import { getLLMResponse } from "./utils/llm.js";

// Simple delay helper function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Test various LLM call patterns
async function testImprovedThrottling() {
  try {
    console.log("=== TESTING IMPROVED LLM THROTTLING MECHANISM ===");
    console.log("Making a series of LLM calls with different delay options...");

    // First call - no special options
    console.log("\n1. Making standard LLM call (uses default delay if needed)");
    const response1 = await getLLMResponse("List 3 programming languages");
    console.log("Response 1:", response1.slice(0, 100) + "...");

    // Second call - skipDelay option
    console.log("\n2. Making LLM call with skipDelay option (no waiting)");
    const response2 = await getLLMResponse("List 3 web frameworks", {
      skipDelay: true,
    });
    console.log("Response 2:", response2.slice(0, 100) + "...");

    // Third call - custom delay of 5 seconds
    console.log("\n3. Making LLM call with custom delay of 5 seconds");
    const response3 = await getLLMResponse("List 3 database systems", {
      customDelay: 5000,
    });
    console.log("Response 3:", response3.slice(0, 100) + "...");

    // Fourth call - force delay option regardless of time since last request
    console.log(
      "\n4. Making LLM call with forceDelay option (wait full delay time)"
    );
    const response4 = await getLLMResponse("List 3 cloud providers", {
      forceDelay: true,
      customDelay: 7000,
    });
    console.log("Response 4:", response4.slice(0, 100) + "...");

    // Simulate parallel calls
    console.log(
      "\n5. Making 3 parallel LLM calls (all with different delay options)"
    );
    const promises = [
      getLLMResponse("List 3 frontend libraries", { skipDelay: true }),
      getLLMResponse("List 3 backend frameworks", { customDelay: 3000 }),
      getLLMResponse("List 3 testing frameworks", {
        forceDelay: true,
        customDelay: 2000,
      }),
    ];

    const [response5, response6, response7] = await Promise.all(promises);
    console.log("Response 5 (skipDelay):", response5.slice(0, 100) + "...");
    console.log("Response 6 (customDelay):", response6.slice(0, 100) + "...");
    console.log("Response 7 (forceDelay):", response7.slice(0, 100) + "...");

    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Error during throttling tests:", error);
  }
}

// Run the test
testImprovedThrottling();
