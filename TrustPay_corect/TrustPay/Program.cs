using Microsoft.EntityFrameworkCore;
using TrustPay.Data;
using TrustPay.Models;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<DbTrustPayContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TrustPayDB")));
builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:3000") // React server
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowFrontend");
}





app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
