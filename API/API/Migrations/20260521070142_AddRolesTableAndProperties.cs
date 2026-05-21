using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddRolesTableAndProperties : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The Roles table already exists in the database with the correct schema,
            // so we do not need to run any DDL commands.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No action needed as this is a schema alignment migration.
        }
    }
}
