import { Profile } from "@application/entities/Profile";
import { GoalCalculator } from "@application/services/GoalCalculator";
import { describe, expect, it } from "vitest";

function makeProfile(overrides: Partial<Profile.Attributes> = {}): Profile {
  return new Profile({
    accountId: "acc_123",
    name: "João",
    birthDate: new Date("1995-06-15"),
    gender: Profile.Gender.MALE,
    height: 180,
    weight: 80,
    activityLevel: Profile.ActivityLevel.MODERATE,
    goal: Profile.Goal.MAINTAIN,
    ...overrides,
  });
}

describe("GoalCalculator", () => {
  it("should calculate goals for a MALE maintaining weight", () => {
    const profile = makeProfile();
    const goal = GoalCalculator.calculate(profile, Profile.Goal.MAINTAIN);

    expect(goal.accountId).toBe("acc_123");
    expect(goal.calories).toBeGreaterThan(0);
    expect(goal.proteins).toBeGreaterThan(0);
    expect(goal.carbohydrates).toBeGreaterThan(0);
    expect(goal.fats).toBeGreaterThan(0);
  });

  it("should calculate lower calories for LOSE goal", () => {
    const profile = makeProfile({ goal: Profile.Goal.LOSE });

    const maintainGoal = GoalCalculator.calculate(
      profile,
      Profile.Goal.MAINTAIN,
    );
    const loseGoal = GoalCalculator.calculate(profile, Profile.Goal.LOSE);

    expect(loseGoal.calories).toBeLessThan(maintainGoal.calories);
  });

  it("should calculate higher calories for GAIN goal", () => {
    const profile = makeProfile({ goal: Profile.Goal.GAIN });

    const maintainGoal = GoalCalculator.calculate(
      profile,
      Profile.Goal.MAINTAIN,
    );
    const gainGoal = GoalCalculator.calculate(profile, Profile.Goal.GAIN);

    expect(gainGoal.calories).toBeGreaterThan(maintainGoal.calories);
  });

  it("should calculate different BMR for FEMALE", () => {
    const male = makeProfile({ gender: Profile.Gender.MALE });
    const female = makeProfile({ gender: Profile.Gender.FEMALE });

    const maleGoal = GoalCalculator.calculate(male, Profile.Goal.MAINTAIN);
    const femaleGoal = GoalCalculator.calculate(female, Profile.Goal.MAINTAIN);

    expect(maleGoal.calories).not.toBe(femaleGoal.calories);
    expect(maleGoal.calories).toBeGreaterThan(femaleGoal.calories);
  });

  it("should apply higher multiplier for more active profiles", () => {
    const sedentary = makeProfile({
      activityLevel: Profile.ActivityLevel.SEDENTARY,
    });
    const athlete = makeProfile({
      activityLevel: Profile.ActivityLevel.ATHLETE,
    });

    const sedentaryGoal = GoalCalculator.calculate(
      sedentary,
      Profile.Goal.MAINTAIN,
    );
    const athleteGoal = GoalCalculator.calculate(
      athlete,
      Profile.Goal.MAINTAIN,
    );

    expect(athleteGoal.calories).toBeGreaterThan(sedentaryGoal.calories);
  });

  it("should return rounded values", () => {
    const profile = makeProfile();
    const goal = GoalCalculator.calculate(profile, Profile.Goal.MAINTAIN);

    expect(goal.calories).toBe(Math.round(goal.calories));
    expect(goal.proteins).toBe(Math.round(goal.proteins));
    expect(goal.carbohydrates).toBe(Math.round(goal.carbohydrates));
    expect(goal.fats).toBe(Math.round(goal.fats));
  });

  it("should handle height in meters (< 3) by converting to cm", () => {
    const profileCm = makeProfile({ height: 180 });
    const profileM = makeProfile({ height: 1.8 });

    const goalCm = GoalCalculator.calculate(profileCm, Profile.Goal.MAINTAIN);
    const goalM = GoalCalculator.calculate(profileM, Profile.Goal.MAINTAIN);

    expect(goalCm.calories).toBe(goalM.calories);
  });
});
