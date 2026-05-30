using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueCourseSubjectIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.CreateIndex(
            //     name: "IX_CourseSubjects_CourseId_SubjectId",
            //     table: "CourseSubjects",
            //     columns: new[] { "CourseId", "SubjectId" },
            //     unique: true);

            // migrationBuilder.DropIndex(
            //     name: "IX_CourseSubjects_CourseId",
            //     table: "CourseSubjects");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CourseSubjects_CourseId_SubjectId",
                table: "CourseSubjects");

            migrationBuilder.CreateIndex(
                name: "IX_CourseSubjects_CourseId",
                table: "CourseSubjects",
                column: "CourseId");
        }
    }
}
