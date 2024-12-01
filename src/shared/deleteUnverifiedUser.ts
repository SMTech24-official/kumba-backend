import prisma from "./prisma";

export const deleteUnverifiedUsers = async () => {
    // Delete unverified users whose OtpExpires date is less than the current date
    try {
        const deleteCount = await prisma.user.deleteMany({
            where: {
                OtpExpires: {
                    lt: new Date() // Check if OtpExpires is less than the current date
                },
                isVerified: false // Ensure the user is unverified
            }
        });
       
    } catch (error) {
        throw new Error("Failed to delete unverified users");
    }
};
