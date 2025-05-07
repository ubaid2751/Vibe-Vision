const express = require("express")
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const { userModel } = require("./DB");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const JWT_USER_SEC = "STU@!@#$";
const userRouter = express.Router();

async function signupHandler(req, res) {
    try {
        const userSchema = z.object({
            email: z.string().email().min(3).max(100),
            password: z.string().min(8).max(20),
            name: z.string().min(3).max(25)
        });

        const parsedData = userSchema.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(400).json({
                message: "Incorrect user details",
                error: parsedData.error.errors,
            });
        }

        const { email, password, name } = parsedData.data;

        const hashedPassword = await bcrypt.hash(password, 5);

        await userModel.create({
            email,
            password: hashedPassword,
            name
        });

        return res.status(201).json({
            message: "User signed up successfully",
        });
    } catch (error) {
        console.error("Error while creating user:", error.message);
        return res.status(500).json({
            message: "Error while signing up",
        });
    }
}

async function loginHandler(req, res) {
    try {
        const userSchema = z.object({
            email: z.string().email().min(5).max(100),
            password: z.string().min(8).max(20),
        });

        const parsedData = userSchema.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(400).json({
                message: "Incorrect parameters",
                errors: parsedData.error.issues,
            });
        }

        const { email, password } = parsedData.data;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(403).json({
                message: "User not found",
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const jwt = JWT.sign({ _id: user._id }, JWT_USER_SEC);

            return res.status(200).json({
                message: "Login successful",
                user: { email: user.email, id: user._id, name: user.name, JWT: jwt },
            });
        } else {
            return res.status(403).json({
                message: "Incorrect password",
            });
        }
    } catch (error) {
        console.error("Error during login:", error);

        return res.status(500).json({
            message: "Error while logging in",
            error: error.message,
        });
    }
}


userRouter.post("/signup",signupHandler);

userRouter.post("/login",loginHandler);

userRouter.get("/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = JWT.verify(token, JWT_USER_SEC);
        const user = await userModel.findById(decoded._id).select("-password"); // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});
userRouter.put("/update-profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = JWT.verify(token, JWT_USER_SEC);
        const { name, email } = req.body;

        const updatedUser = await userModel.findByIdAndUpdate(
            decoded._id,
            { name, email },
            { new: true, runValidators: true }
        );

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
});
userRouter.post("/save-analysis", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = JWT.verify(token, JWT_USER_SEC);
        const { emotions } = req.body;

        await userModel.findByIdAndUpdate(
            decoded._id,
            { $push: { analysisHistory: { emotions } } },
            { new: true }
        );

        res.json({ message: "Analysis saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error saving analysis" });
    }
});

userRouter.get("/analysis-history", async (req, res) => {
  try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
          return res.status(401).json({ message: "Unauthorized - No token" });
      }

      let decoded;
      try {
          decoded = JWT.verify(token, JWT_USER_SEC);
      } catch (jwtError) {
          console.error("JWT Verification Error:", jwtError);
          return res.status(401).json({ message: "Unauthorized - Invalid token" });
      }

      const userId = decoded._id; // Assuming `_id` contains user ID

      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "Invalid user ID format" });
      }

      const user = await userModel.findById(userId).select("analysisHistory");

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.json(user.analysisHistory); // send the array directly

  } catch (error) {
      console.error("Error fetching analysis history:", error); // Log the error
      res.status(500).json({ message: "Error fetching analysis history" });
  }
});

module.exports = {
    userRouter
}