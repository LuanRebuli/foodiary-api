import { Goal } from "@application/entities/Goal";
import { Profile } from "@application/entities/Profile";

export class GoalCalculator {
  private static macroRatios: Record<Profile.Goal, GoalCalculator.MacroRatio> =
    {
      [Profile.Goal.LOSE]: {
        proteins: 2.2,
        fats: 0.8,
      },
      [Profile.Goal.MAINTAIN]: {
        proteins: 2,
        fats: 0.9,
      },
      [Profile.Goal.GAIN]: {
        proteins: 2.2,
        fats: 1,
      },
    };

  private static activityMultipliers: Record<Profile.ActivityLevel, number> = {
    [Profile.ActivityLevel.SEDENTARY]: 1.2,
    [Profile.ActivityLevel.LIGHT]: 1.375,
    [Profile.ActivityLevel.MODERATE]: 1.55,
    [Profile.ActivityLevel.HEAVY]: 1.725,
    [Profile.ActivityLevel.ATHLETE]: 1.9,
  };

  private static calorieAdjustment: Record<Profile.Goal, number> = {
    [Profile.Goal.LOSE]: -500,
    [Profile.Goal.MAINTAIN]: 0,
    [Profile.Goal.GAIN]: 300,
  };

  static calculate(profile: Profile, goal: Profile.Goal): Goal {
    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);
    const targetCalories = this.adjustCaloriesForGoal(tdee, goal);
    const macros = this.calculateMacros(profile.weight, targetCalories, goal);

    return new Goal({
      accountId: profile.accountId,
      calories: Math.round(targetCalories),
      proteins: Math.round(macros.proteins),
      carbohydrates: Math.round(macros.carbohydrates),
      fats: Math.round(macros.fats),
    });
  }

  private static calculateBMR(profile: Profile): number {
    const age = this.calculateAge(profile.birthDate);
    const { weight, gender } = profile;

    const height = profile.height < 3 ? profile.height * 100 : profile.height;

    if (gender === Profile.Gender.MALE) {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  private static calculateTDEE(
    bmr: number,
    activityLevel: Profile.ActivityLevel,
  ): number {
    const multiplier = this.activityMultipliers[activityLevel];
    return bmr * multiplier;
  }

  private static adjustCaloriesForGoal(
    tdee: number,
    goal: Profile.Goal,
  ): number {
    const adjustment = this.calorieAdjustment[goal];
    return tdee + adjustment;
  }

  private static calculateMacros(
    weight: number,
    calories: number,
    goal: Profile.Goal,
  ): GoalCalculator.Macros {
    const ratio = this.macroRatios[goal];

    const proteins = weight * ratio.proteins;
    const proteinCalories = proteins * 4;

    const fats = weight * ratio.fats;
    const fatCalories = fats * 9;

    const remainingCalories = calories - proteinCalories - fatCalories;
    const carbohydrates = remainingCalories / 4;

    return {
      proteins,
      carbohydrates,
      fats,
    };
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }
}

export namespace GoalCalculator {
  export type MacroRatio = {
    proteins: number;
    fats: number;
  };

  export type Macros = {
    proteins: number;
    carbohydrates: number;
    fats: number;
  };
}
