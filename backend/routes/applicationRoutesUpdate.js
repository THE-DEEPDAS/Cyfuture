// Path: d:\Cyfuture 3\backend\routes\applicationRoutes.js
// Add route for evaluating screening responses

// Import the evaluateScreeningResponses controller
import { evaluateScreeningResponses } from "../controllers/evaluateScreeningResponses.js";

// Add the route to the applications router
// POST /api/applications/:id/evaluate-screening
router.post("/:id/evaluate-screening", protect, evaluateScreeningResponses);
